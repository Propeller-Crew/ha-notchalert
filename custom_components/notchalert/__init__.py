"""«Тривога в нотчі» для Home Assistant: тривога, загрози, дрон поруч, світло й небо для одного місця ключа."""

from __future__ import annotations

from homeassistant.const import CONF_API_KEY, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType

from .api import NotchAlertClient
from .card import async_register_card
from .const import DOMAIN
from .coordinator import NotchAlertConfigEntry, NotchAlertCoordinator

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    await async_register_card(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: NotchAlertConfigEntry) -> bool:
    client = NotchAlertClient(async_get_clientsession(hass), entry.data[CONF_API_KEY])
    coordinator = NotchAlertCoordinator(hass, entry, client)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # Long-poll: тривога за секунду. Скасовується разом із записом; опитування раз на 30 с — запасне.
    entry.async_create_background_task(hass, coordinator.long_poll(), f"{DOMAIN} long-poll {entry.entry_id}")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: NotchAlertConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
