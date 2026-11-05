"""Спільне для сутностей: один пристрій на місце ключа."""

from __future__ import annotations

from typing import Any

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NotchAlertCoordinator


class NotchAlertEntity(CoordinatorEntity[NotchAlertCoordinator]):
    _attr_has_entity_name = True
    # Блок відповіді, від свіжості якого залежить сутність: «даних нема» — unavailable, а не «тихо».
    block: str = "alert"

    def __init__(self, coordinator: NotchAlertCoordinator, key: str) -> None:
        super().__init__(coordinator)
        entry = coordinator.config_entry
        self._attr_unique_id = f"{entry.unique_id}:{key}"
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.unique_id or entry.entry_id)},
            name=entry.title,
            manufacturer="Тривога в нотчі",
            model="NotchAlert",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://notchalert.propellercrew.com",
        )

    @property
    def place(self) -> dict[str, Any]:
        return (self.coordinator.data or {}).get("place") or {}

    @property
    def part(self) -> dict[str, Any]:
        return self.place.get(self.block) or {}

    @property
    def available(self) -> bool:
        return super().available and bool(self.part.get("fresh"))
