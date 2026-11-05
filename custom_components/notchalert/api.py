"""Клієнт GET /v1/device: ключ у заголовку, ETag, 401 і 429 з Retry-After."""

from __future__ import annotations

import asyncio
from typing import Any

import aiohttp

from .const import API_URL, DEFAULT_RETRY_AFTER, REQUEST_TIMEOUT


class NotchAlertError(Exception):
    """Сервер недоступний або відповів не так."""


class NotchAlertAuthError(NotchAlertError):
    """Ключ невідомий або відкликаний (401)."""


class NotchAlertRateLimited(NotchAlertError):
    """429: сервер просить почекати `retry_after` секунд."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(f"rate limited, retry after {retry_after} s")
        self.retry_after = retry_after


def retry_after(value: str | None) -> int:
    try:
        return max(1, int(value or ""))
    except ValueError:
        return DEFAULT_RETRY_AFTER


class NotchAlertClient:
    """Один ключ — один клієнт. Тримає ETag і останню відповідь: без змін сервер дає 304 і нуль байт."""

    def __init__(self, session: aiohttp.ClientSession, key: str, url: str = API_URL) -> None:
        self._session = session
        self._key = key.strip()
        self._url = url
        self._etag: str | None = None
        self._last: dict[str, Any] | None = None
        # Чи сервер уміє тримати запит (відповідає X-Wait). None — ще не знаємо.
        self.waits: bool | None = None
        # Чи сервер цього разу справді тримав запит (X-Wait > 0). «0» — зараз не тримає (зміна вже була чи
        # забагато тих, що чекають), і тоді не можна одразу питати знову.
        self.held = False

    async def fetch(self, wait: int = 0) -> dict[str, Any]:
        """Стан ключа.  > 0 — long-poll: сервер відповідає, щойно стан зміниться, або за  с (304)."""
        headers = {"Authorization": f"Bearer {self._key}", "Accept": "application/json"}
        if self._etag and self._last is not None:
            headers["If-None-Match"] = self._etag
        params = {"wait": str(wait)} if wait and self._last is not None else None
        timeout = REQUEST_TIMEOUT + (wait if params else 0)
        try:
            async with self._session.get(
                self._url, headers=headers, params=params, timeout=aiohttp.ClientTimeout(total=timeout)
            ) as resp:
                if params:
                    self.waits = "X-Wait" in resp.headers
                    self.held = resp.headers.get("X-Wait") not in (None, "0")
                if resp.status == 304 and self._last is not None:
                    return self._last
                if resp.status == 401:
                    raise NotchAlertAuthError("unauthorized")
                if resp.status == 429:
                    raise NotchAlertRateLimited(retry_after(resp.headers.get("Retry-After")))
                if resp.status != 200:
                    raise NotchAlertError(f"HTTP {resp.status}")
                data = await resp.json(content_type=None)
                if not isinstance(data, dict) or not isinstance(data.get("places"), list):
                    raise NotchAlertError("unexpected response")
                self._etag = resp.headers.get("ETag")
                self._last = data
                return data
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            raise NotchAlertError(str(err) or type(err).__name__) from err
