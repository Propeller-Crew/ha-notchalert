"""Налаштування: ключ із апки (iPhone, Android, мак → «Home Assistant») і вибір місця ключа."""

from __future__ import annotations

import hashlib
from collections.abc import Mapping
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_API_KEY
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .api import NotchAlertAuthError, NotchAlertClient, NotchAlertError, NotchAlertRateLimited
from .const import CONF_PLACE, DOMAIN

KEY_SCHEMA = vol.Schema({vol.Required(CONF_API_KEY): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))})


def key_id(key: str) -> str:
    """Не сам ключ: у unique_id і логах лише короткий хеш."""
    return hashlib.sha256(key.strip().encode()).hexdigest()[:12]


def place_title(place: dict[str, Any]) -> str:
    return place.get("name") or (place.get("label") or "").title() or f"#{place.get('id')}"


async def check_key(hass, key: str) -> tuple[dict[str, Any] | None, str | None]:
    """(відповідь, помилка для форми)."""
    try:
        return await NotchAlertClient(async_get_clientsession(hass), key).fetch(), None
    except NotchAlertAuthError:
        return None, "invalid_auth"
    except NotchAlertRateLimited:
        return None, "rate_limited"
    except NotchAlertError:
        return None, "cannot_connect"


class NotchAlertConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self._key: str = ""
        self._places: list[dict[str, Any]] = []

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            self._key = user_input[CONF_API_KEY].strip()
            data, error = await check_key(self.hass, self._key)
            if error:
                errors["base"] = error
            elif not data["places"]:
                errors["base"] = "no_places"
            else:
                self._places = data["places"]
                if len(self._places) == 1:
                    return await self._create(self._places[0])
                return await self.async_step_place()
        return self.async_show_form(step_id="user", data_schema=KEY_SCHEMA, errors=errors)

    async def async_step_place(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            place = next(p for p in self._places if p["id"] == user_input[CONF_PLACE])
            return await self._create(place)
        options = [SelectOptionDict(value=p["id"], label=place_title(p)) for p in self._places]
        return self.async_show_form(
            step_id="place",
            data_schema=vol.Schema({vol.Required(CONF_PLACE): SelectSelector(SelectSelectorConfig(options=options))}),
        )

    async def _create(self, place: dict[str, Any]) -> ConfigFlowResult:
        await self.async_set_unique_id(f"{key_id(self._key)}:{place['id']}")
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title=place_title(place), data={CONF_API_KEY: self._key, CONF_PLACE: place["id"]})

    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        """Ключ відкликали (в апці «Видати новий ключ» чи «Вимкнути») — просимо новий, місце те саме."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()
        if user_input is not None:
            key = user_input[CONF_API_KEY].strip()
            data, error = await check_key(self.hass, key)
            if error:
                errors["base"] = error
            else:
                ids = {p["id"] for p in data["places"]}
                place = entry.data[CONF_PLACE] if entry.data[CONF_PLACE] in ids else data["places"][0]["id"]
                return self.async_update_reload_and_abort(entry, data_updates={CONF_API_KEY: key, CONF_PLACE: place})
        return self.async_show_form(step_id="reauth_confirm", data_schema=KEY_SCHEMA, errors=errors,
                                    description_placeholders={"place": entry.title})
