"""Діагностика без ключа: лише відповідь сервера для цього місця."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_API_KEY
from homeassistant.core import HomeAssistant

from .coordinator import NotchAlertConfigEntry


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: NotchAlertConfigEntry) -> dict[str, Any]:
    return {"entry": async_redact_data(dict(entry.data), {CONF_API_KEY}), "options": dict(entry.options),
            "data": entry.runtime_data.data}
