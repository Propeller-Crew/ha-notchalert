"""Опитування /v1/device (запасне, раз на 30 с), long-poll для миттєвої тривоги й події для автоматизацій."""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import NotchAlertAuthError, NotchAlertClient, NotchAlertError, NotchAlertRateLimited
from .const import (
    CONF_PLACE,
    DOMAIN,
    EVENT_ALERT_ENDED,
    EVENT_ALERT_STARTED,
    EVENT_DRONE_NEAR,
    EVENT_THREAT,
    SCAN_INTERVAL,
    WAIT,
)

_LOGGER = logging.getLogger(__name__)

type NotchAlertConfigEntry = ConfigEntry[NotchAlertCoordinator]


def pick_place(data: dict[str, Any], place_id: str, name: str | None = None) -> dict[str, Any] | None:
    places = data.get("places") or []
    return next((p for p in places if p.get("id") == place_id), None) or (
        next((p for p in places if name and p.get("name") == name), None)
    )


class NotchAlertCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Дані одного місця ключа: {"place": {...}, "now": unix}."""

    config_entry: NotchAlertConfigEntry

    def __init__(self, hass: HomeAssistant, entry: NotchAlertConfigEntry, client: NotchAlertClient) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=DOMAIN, update_interval=timedelta(seconds=SCAN_INTERVAL))
        self.client = client
        self.place_id: str = entry.data[CONF_PLACE]
        # Коли long-poll востаннє отримав відповідь (monotonic). Свіжа — запасне опитування не ходить у мережу.
        self.live_at = 0.0
        self.paused_until = 0.0   # після 429: ні опитування, ні long-poll до цього часу

    def _shape(self, data: dict[str, Any]) -> dict[str, Any]:
        place = pick_place(data, self.place_id, self.config_entry.title)
        if place is None:
            raise UpdateFailed("this place is no longer on the key; reconfigure the integration")
        if self.data:
            self._fire_events(self.data["place"], place, data.get("now"))
        return {"place": place, "now": data.get("now")}

    async def _async_update_data(self) -> dict[str, Any]:
        if self.data and time.monotonic() - self.live_at < WAIT + 10:
            return self.data   # long-poll живий і сам приносить зміни — зайвий запит серверу ні до чого
        try:
            data = await self.client.fetch()
        except NotchAlertAuthError as err:
            raise ConfigEntryAuthFailed("key revoked or unknown") from err
        except NotchAlertRateLimited as err:
            # Сервер сказав, скільки чекати, — чекаємо рівно стільки, без повторів раніше.
            self.paused_until = time.monotonic() + err.retry_after
            raise UpdateFailed(f"rate limited by server for {err.retry_after} s", retry_after=err.retry_after) from err
        except NotchAlertError as err:
            raise UpdateFailed(f"server unreachable: {err}") from err
        return self._shape(data)

    async def long_poll(self) -> None:
        """Тримає запит до сервера, доки стан не зміниться: тривога в HA за секунду, а не до 30 с. Сервер, що не
        вміє чекати (нема X-Wait), — вимикаємо й лишаємось на опитуванні. Помилки — пауза; опитування тим часом
        працює, і 401 воно ж перетворить на «потрібен новий ключ»."""
        while True:
            pause = self.paused_until - time.monotonic()
            if pause > 0:
                await asyncio.sleep(pause)
            started = time.monotonic()
            try:
                data = await self.client.fetch(wait=WAIT)
            except NotchAlertRateLimited as err:
                self.paused_until = time.monotonic() + err.retry_after
                continue
            except NotchAlertError:
                self.live_at = 0.0
                await asyncio.sleep(SCAN_INTERVAL)
                continue
            if self.client.waits is False:
                _LOGGER.debug("server does not hold requests; polling every %s s", SCAN_INTERVAL)
                self.live_at = 0.0
                return
            self.live_at = time.monotonic()
            try:
                shaped = self._shape(data)
            except UpdateFailed:
                self.live_at = 0.0
                await asyncio.sleep(SCAN_INTERVAL)
                continue
            changed = shaped != self.data
            if changed:
                self.async_set_updated_data(shaped)
            elif not self.client.held or time.monotonic() - started < 5:
                # Сервер відповів одразу й без змін — не тримав. Не долбимо: наступна спроба за 30 с.
                await asyncio.sleep(SCAN_INTERVAL)

    def _fire_events(self, old: dict[str, Any], new: dict[str, Any], now: Any) -> None:
        """Лише на переходах між двома свіжими станами: «даних нема» — не відбій і не тривога."""
        base = {"entry_id": self.config_entry.entry_id, "place": new.get("name") or self.config_entry.title}
        a0, a1 = old.get("alert") or {}, new.get("alert") or {}
        if a0.get("fresh") and a1.get("fresh"):
            if a1.get("on") and not a0.get("on"):
                self.hass.bus.async_fire(EVENT_ALERT_STARTED, {
                    **base, "level": a1.get("level"), "threats": a1.get("threats") or [],
                    "since": a1.get("since"), "reason": a1.get("reason")})
            elif a0.get("on") and not a1.get("on"):
                since = a0.get("since")
                lasted = (int(now) - int(since)) // 60 if since and now else None
                self.hass.bus.async_fire(EVENT_ALERT_ENDED, {**base, "lasted_min": lasted})
            if a1.get("on"):
                before = set(a0.get("threats") or []) if a0.get("on") else set()
                for kind in a1.get("threats") or []:
                    if kind not in before:
                        self.hass.bus.async_fire(EVENT_THREAT, {**base, "threat": kind, "level": a1.get("level")})
        n0, n1 = old.get("near") or {}, new.get("near") or {}
        if n0.get("fresh") and n1.get("fresh") and n1.get("on") and not n0.get("on"):
            self.hass.bus.async_fire(EVENT_DRONE_NEAR, {**base, "km": n1.get("km"), "detail": n1.get("detail")})
