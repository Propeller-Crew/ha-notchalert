"""Тривога, дрон поруч, світло — так/ні для автоматизацій."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .coordinator import NotchAlertConfigEntry
from .entity import NotchAlertEntity


def ts(value: Any):
    return dt_util.utc_from_timestamp(value).isoformat() if isinstance(value, (int, float)) else None


async def async_setup_entry(hass: HomeAssistant, entry: NotchAlertConfigEntry,
                            async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    c = entry.runtime_data
    place = c.data["place"]
    entities: list[BinarySensorEntity] = [AlertBinary(c)]
    if "near" in place:
        entities.append(DroneNearBinary(c))
    if "power" in place:
        entities.append(PowerBinary(c))
    async_add_entities(entities)


class AlertBinary(NotchAlertEntity, BinarySensorEntity):
    """Повітряна тривога в районі (офіційна; рівень і загрози — окремими сутностями)."""

    _attr_device_class = BinarySensorDeviceClass.SAFETY

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "alert")

    @property
    def is_on(self) -> bool:
        return bool(self.part.get("on"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        a = self.part
        return {"level": a.get("level") or "none", "threats": a.get("threats") or [], "since": ts(a.get("since")),
                "reason": a.get("reason")}


class DroneNearBinary(NotchAlertEntity, BinarySensorEntity):
    """Дрон у радіусі від дому — те саме, що острівець айфона в цій точці."""

    _attr_device_class = BinarySensorDeviceClass.SAFETY
    block = "near"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "drone_near")

    @property
    def is_on(self) -> bool:
        return bool(self.part.get("on"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"km": self.part.get("km"), "detail": self.part.get("detail")}


class PowerBinary(NotchAlertEntity, BinarySensorEntity):
    """Світло за графіком: є / нема. «Можливе відключення» і «графіка ще нема» — невідомо."""

    _attr_device_class = BinarySensorDeviceClass.POWER
    block = "power"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "power")

    @property
    def is_on(self) -> bool | None:
        state = self.part.get("state")
        return {"on": True, "off": False}.get(state)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"group": self.part.get("group"), "state": self.part.get("state")}
