"""Картка панелі (05.11): інтеграція сама віддає її фронтенду, тож ставити окремо через HACS «Dashboard» чи
додавати ресурс руками не треба. Після оновлення інтеграції браузер бере нову картку: у посиланні версія."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

CARD_FILE = Path(__file__).parent / "frontend" / "notchalert-card.js"
CARD_PATH = "/notchalert/notchalert-card.js"


# Читається при імпорті (не в циклі подій Home Assistant).
VERSION = json.loads((Path(__file__).parent / "manifest.json").read_text())["version"]


def card_url() -> str:
    return f"{CARD_PATH}?v={VERSION}"


async def async_register_card(hass: HomeAssistant) -> None:
    """Файл картки на /notchalert/… і модуль у кожній сторінці фронтенду (як вбудовані картки: є в «Додати
    картку» і в YAML-панелях). Без http чи frontend (тести, мінімальна конфігурація) — тихо без картки."""
    if hass.http is None:
        return
    from homeassistant.components.http import StaticPathConfig

    try:
        await hass.http.async_register_static_paths([StaticPathConfig(CARD_PATH, str(CARD_FILE), True)])
    except RuntimeError:
        return  # уже зареєстровано: інтеграцію перезавантажили без перезапуску Home Assistant
    try:
        from homeassistant.components.frontend import add_extra_js_url

        add_extra_js_url(hass, card_url())
    except (ImportError, KeyError):
        _LOGGER.debug("frontend is not loaded; the card is served at %s but not added to pages", CARD_PATH)
