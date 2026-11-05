"""Тести інтеграції: custom_components з ../custom_components, мережа — aioclient_mock."""

import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield
