"""Рівень, загрози, коли почалась і скінчилась, відстань до дрона, світло, небо над областю."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import UnitOfLength
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import LEVELS, POWER_STATES, THREATS
from .coordinator import NotchAlertConfigEntry
from .entity import NotchAlertEntity


def when(value: Any) -> datetime | None:
    return dt_util.utc_from_timestamp(value) if isinstance(value, (int, float)) and value > 0 else None


async def async_setup_entry(hass: HomeAssistant, entry: NotchAlertConfigEntry,
                            async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    c = entry.runtime_data
    place = c.data["place"]
    entities: list[SensorEntity] = [LevelSensor(c), ThreatsSensor(c), AlertSinceSensor(c), LastClearSensor(c)]
    if "near" in place:
        entities.append(DroneDistanceSensor(c))
    if "power" in place:
        entities += [PowerStateSensor(c), PowerChangeSensor(c), NextOutageSensor(c)]
    if "sky" in place:
        entities.append(SkyTargetsSensor(c))
    async_add_entities(entities)


class LevelSensor(NotchAlertEntity, SensorEntity):
    """none / yellow / red — офіційний рівень; важкі загрози (балістика, масована) роблять його червоним."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = list(LEVELS)

    def __init__(self, c) -> None:
        super().__init__(c, "alert_level")

    @property
    def native_value(self) -> str:
        return (self.part.get("level") or "yellow") if self.part.get("on") else "none"


class ThreatsSensor(NotchAlertEntity, SensorEntity):
    """Найважча загроза зараз (none, massive, ballistic, …) — перелік, щоб стан перекладався. Усі загрози — в
    атрибуті list і по одному так/ні на кожну, для умов автоматизацій."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["none", *THREATS]

    def __init__(self, c) -> None:
        super().__init__(c, "threats")

    @property
    def threats(self) -> list[str]:
        return list(self.part.get("threats") or []) if self.part.get("on") else []

    @property
    def native_value(self) -> str:
        return next((k for k in THREATS if k in self.threats), "none")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"list": self.threats, **{k: k in self.threats for k in THREATS}}


class AlertSinceSensor(NotchAlertEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, c) -> None:
        super().__init__(c, "alert_since")

    @property
    def native_value(self) -> datetime | None:
        return when(self.part.get("since")) if self.part.get("on") else None


class LastClearSensor(NotchAlertEntity, SensorEntity):
    """Коли був останній відбій (сервер пам'ятає з журналу місця)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, c) -> None:
        super().__init__(c, "last_clear")

    @property
    def native_value(self) -> datetime | None:
        return when(self.place.get("quiet_since"))


class DroneDistanceSensor(NotchAlertEntity, SensorEntity):
    """Відстань до найближчого дрона в радіусі; нема дрона або відстані — порожньо (не вигадуємо)."""

    _attr_device_class = SensorDeviceClass.DISTANCE
    _attr_native_unit_of_measurement = UnitOfLength.KILOMETERS
    _attr_state_class = SensorStateClass.MEASUREMENT
    block = "near"

    def __init__(self, c) -> None:
        super().__init__(c, "drone_distance")

    @property
    def native_value(self) -> float | None:
        return self.part.get("km") if self.part.get("on") else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"detail": self.part.get("detail")}


class PowerStateSensor(NotchAlertEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = list(POWER_STATES)
    block = "power"

    def __init__(self, c) -> None:
        super().__init__(c, "power_state")

    @property
    def native_value(self) -> str | None:
        return self.part.get("state") if self.part.get("state") in POWER_STATES else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        # intervals і known_until — для картки панелі (смуга світла на добу) і для шаблонів: відключення й
        # «можливо» наперед; далі known_until графіка ще нема, і там не «світло є», а невідомо.
        intervals = [{"start": when(a).isoformat(), "end": when(b).isoformat(), "state": k}
                     for a, b, k in self.part.get("intervals") or [] if when(a) and when(b)]
        known = when(self.part.get("known_until"))
        return {"group": self.part.get("group"), "slots": self.place.get("slots") or [], "intervals": intervals,
                "known_until": known.isoformat() if known else None}


class PowerChangeSensor(NotchAlertEntity, SensorEntity):
    """Коли світло перемкнеться за графіком (дали — вимкнуть, нема — увімкнуть). Атрибут next — у що."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    block = "power"

    def __init__(self, c) -> None:
        super().__init__(c, "power_change")

    @property
    def native_value(self) -> datetime | None:
        return when(self.part.get("until"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"next": self.part.get("next")}


class NextOutageSensor(NotchAlertEntity, SensorEntity):
    """Початок наступного відключення за графіком (зараз без світла — наступного після цього)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    block = "power"

    def __init__(self, c) -> None:
        super().__init__(c, "next_outage")

    @property
    def next(self) -> list | None:
        now = (self.coordinator.data or {}).get("now") or dt_util.utcnow().timestamp()
        return next((iv for iv in self.part.get("intervals") or [] if iv[2] == "off" and iv[0] > now), None)

    @property
    def native_value(self) -> datetime | None:
        return when(self.next[0]) if self.next else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"end": when(self.next[1]).isoformat() if self.next else None}


class SkyTargetsSensor(NotchAlertEntity, SensorEntity):
    """Небо над областю за моніторами: скільки цілей ведуть зараз; решта — атрибутами."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    block = "sky"

    def __init__(self, c) -> None:
        super().__init__(c, "sky_targets")

    @property
    def native_value(self) -> int | None:
        return self.part.get("targets")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {k: self.part.get(k) for k in ("approach", "away", "shot_down", "weapons", "quiet_min", "window_min")}
