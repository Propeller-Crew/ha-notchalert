"""Config flow, сутності, 304/401/429 і події тривоги на відповідях у формі справжнього /v1/device."""

from __future__ import annotations

import asyncio
import copy
from datetime import timedelta

import pytest
from homeassistant.config_entries import SOURCE_REAUTH, SOURCE_USER, ConfigEntryState
from homeassistant.const import CONF_API_KEY, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_capture_events, async_fire_time_changed

from custom_components.notchalert.const import API_URL, CONF_PLACE, DOMAIN

KEY = "na_TEST_not_a_real_key_000000000000"
NOW = 1793877000

QUIET_PLACE = {
    "id": "0", "name": "Ірпінь", "label": "ІРПІНЬ",
    "alert": {"fresh": True, "on": False},
    "near": {"fresh": True, "on": False},
    "sky": {"fresh": True, "targets": 0, "approach": 0, "away": 0, "shot_down": 0, "weapons": [], "quiet_min": 40, "window_min": 60},
    "events": [], "quiet_since": NOW - 3600,
    "power": {"fresh": True, "group": "3.1", "state": "on", "until": NOW + 7200, "next": "off",
              "intervals": [[NOW + 7200, NOW + 14400, "off"], [NOW + 30000, NOW + 33600, "maybe"]], "known_until": NOW + 50000},
    "slots": ["14:00-16:00"], "lines": [],
}


def body(place=None, more=()):
    return {"v": 1, "now": NOW, "places": [place or QUIET_PLACE, *more], "page": []}


def alerting(place=QUIET_PLACE, threats=("ballistic",)):
    p = copy.deepcopy(place)
    p["alert"] = {"fresh": True, "on": True, "level": "red", "threats": list(threats), "since": NOW - 600, "reason": "Ракетна загроза"}
    p["near"] = {"fresh": True, "on": True, "km": 4.0, "detail": "Буча · 4 км"}
    return p


async def setup(hass, aioclient_mock, data=None):
    aioclient_mock.get(API_URL, json=data or body(), headers={"ETag": '"e1"'})
    entry = MockConfigEntry(domain=DOMAIN, unique_id="abc:0", title="Ірпінь", data={CONF_API_KEY: KEY, CONF_PLACE: "0"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def tick(hass, aioclient_mock, data=None, status=200, headers=None, seconds=61):
    aioclient_mock.clear_requests()
    if status == 200:
        aioclient_mock.get(API_URL, json=data, headers={"ETag": '"e2"', **(headers or {})})
    else:
        aioclient_mock.get(API_URL, status=status, headers=headers or {})
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=seconds))
    await hass.async_block_till_done()


async def test_flow_one_place(hass: HomeAssistant, aioclient_mock):
    aioclient_mock.get(API_URL, json=body())
    r = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert r["type"] is FlowResultType.FORM
    r = await hass.config_entries.flow.async_configure(r["flow_id"], {CONF_API_KEY: f"  {KEY} "})
    assert r["type"] is FlowResultType.CREATE_ENTRY
    assert (r["title"], r["data"]) == ("Ірпінь", {CONF_API_KEY: KEY, CONF_PLACE: "0"})
    # Ключ іде лише в заголовку.
    url, headers = aioclient_mock.mock_calls[0][1], aioclient_mock.mock_calls[0][3]
    assert KEY not in str(url) and headers["Authorization"] == f"Bearer {KEY}"


async def test_flow_picks_place_and_errors(hass: HomeAssistant, aioclient_mock):
    aioclient_mock.get(API_URL, status=401)
    r = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    r = await hass.config_entries.flow.async_configure(r["flow_id"], {CONF_API_KEY: KEY})
    assert r["errors"] == {"base": "invalid_auth"}
    aioclient_mock.clear_requests()
    aioclient_mock.get(API_URL, status=429, headers={"Retry-After": "30"})
    r = await hass.config_entries.flow.async_configure(r["flow_id"], {CONF_API_KEY: KEY})
    assert r["errors"] == {"base": "rate_limited"}
    aioclient_mock.clear_requests()
    lviv = {**QUIET_PLACE, "id": "1", "name": "Львів", "label": "ЛЬВІВ"}
    aioclient_mock.get(API_URL, json=body(more=[lviv]))
    r = await hass.config_entries.flow.async_configure(r["flow_id"], {CONF_API_KEY: KEY})
    assert r["step_id"] == "place"
    r = await hass.config_entries.flow.async_configure(r["flow_id"], {CONF_PLACE: "1"})
    assert (r["title"], r["data"][CONF_PLACE]) == ("Львів", "1")


async def test_entities_quiet(hass: HomeAssistant, aioclient_mock):
    await setup(hass, aioclient_mock)
    st = lambda e: hass.states.get(e)
    assert st("binary_sensor.irpin_air_raid_alert").state == "off"
    assert st("sensor.irpin_alert_level").state == "none"
    assert st("sensor.irpin_threat").state == "none"
    assert st("binary_sensor.irpin_drone_nearby").state == "off"
    assert st("sensor.irpin_drone_distance").state == "unknown"
    assert st("binary_sensor.irpin_power_schedule").state == "on"
    assert st("sensor.irpin_power").state == "on"
    assert st("sensor.irpin_next_outage").state == dt_util.utc_from_timestamp(NOW + 7200).isoformat()
    assert st("sensor.irpin_targets_over_the_oblast").state == "0"
    assert st("sensor.irpin_last_all_clear").state == dt_util.utc_from_timestamp(NOW - 3600).isoformat()


async def test_alert_events_and_states(hass: HomeAssistant, aioclient_mock):
    await setup(hass, aioclient_mock)
    started = async_capture_events(hass, "notchalert_alert_started")
    threats = async_capture_events(hass, "notchalert_threat")
    near = async_capture_events(hass, "notchalert_drone_near")
    ended = async_capture_events(hass, "notchalert_alert_ended")
    await tick(hass, aioclient_mock, body(alerting()))
    assert hass.states.get("binary_sensor.irpin_air_raid_alert").state == "on"
    assert hass.states.get("sensor.irpin_alert_level").state == "red"
    assert hass.states.get("sensor.irpin_threat").attributes["ballistic"] is True
    assert hass.states.get("sensor.irpin_threat").state == "ballistic"
    assert hass.states.get("sensor.irpin_drone_distance").state == "4.0"
    assert [e.data["level"] for e in started] == ["red"]
    assert [e.data["threat"] for e in threats] == ["ballistic"]
    assert [e.data["km"] for e in near] == [4.0]
    # Нова загроза посеред тривоги — ще одна подія, стара — ні.
    await tick(hass, aioclient_mock, body(alerting(threats=("ballistic", "kab"))))
    assert [e.data["threat"] for e in threats] == ["ballistic", "kab"]
    # Найважча лишається станом, решта — у списку.
    assert hass.states.get("sensor.irpin_threat").state == "ballistic"
    assert hass.states.get("sensor.irpin_threat").attributes["list"] == ["ballistic", "kab"]
    assert len(started) == 1
    await tick(hass, aioclient_mock, body())
    assert [e.data["lasted_min"] for e in ended] == [10]


async def test_no_data_is_unavailable_not_all_clear(hass: HomeAssistant, aioclient_mock):
    await setup(hass, aioclient_mock, body(alerting()))
    ended = async_capture_events(hass, "notchalert_alert_ended")
    stale = copy.deepcopy(alerting())
    stale["alert"] = {"fresh": False}
    await tick(hass, aioclient_mock, body(stale))
    assert hass.states.get("binary_sensor.irpin_air_raid_alert").state == STATE_UNAVAILABLE
    assert ended == []


async def test_304_keeps_data(hass: HomeAssistant, aioclient_mock):
    await setup(hass, aioclient_mock, body(alerting()))
    aioclient_mock.clear_requests()
    aioclient_mock.get(API_URL, status=304)
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=61))
    await hass.async_block_till_done()
    assert aioclient_mock.mock_calls[0][3]["If-None-Match"] == '"e1"'
    assert hass.states.get("binary_sensor.irpin_air_raid_alert").state == "on"


async def test_429_waits_retry_after(hass: HomeAssistant, aioclient_mock):
    entry = await setup(hass, aioclient_mock)
    await tick(hass, aioclient_mock, status=429, headers={"Retry-After": "600"})
    assert entry.runtime_data.last_update_success is False
    # Хвилина минула — сервер просив 10 хв, запитів нема.
    await tick(hass, aioclient_mock, body())
    assert aioclient_mock.call_count == 0
    await tick(hass, aioclient_mock, body(), seconds=601)
    assert aioclient_mock.call_count == 1


async def test_401_starts_reauth_and_new_key(hass: HomeAssistant, aioclient_mock):
    entry = await setup(hass, aioclient_mock)
    await tick(hass, aioclient_mock, status=401)
    flows = hass.config_entries.flow.async_progress()
    assert [f["context"]["source"] for f in flows] == [SOURCE_REAUTH]
    aioclient_mock.clear_requests()
    aioclient_mock.get(API_URL, json=body())
    r = await hass.config_entries.flow.async_configure(flows[0]["flow_id"], {CONF_API_KEY: "na_NEW_key"})
    assert r["reason"] == "reauth_successful"
    assert entry.data[CONF_API_KEY] == "na_NEW_key"


async def test_interval_fixed_30s_no_options(hass: HomeAssistant, aioclient_mock):
    entry = await setup(hass, aioclient_mock)
    assert entry.runtime_data.update_interval == timedelta(seconds=30)
    with pytest.raises(Exception):
        await hass.config_entries.options.async_init(entry.entry_id)


async def test_long_poll_delivers_alert_without_waiting_for_poll(hass: HomeAssistant, aioclient_mock):
    started = async_capture_events(hass, "notchalert_alert_started")
    aioclient_mock.get(API_URL, json=body(), headers={"ETag": '"e1"'})
    entry = MockConfigEntry(domain=DOMAIN, unique_id="abc:0", title="Ірпінь", data={CONF_API_KEY: KEY, CONF_PLACE: "0"})
    entry.add_to_hass(hass)
    c = None

    # Перший запит — звичайний; другий (long-poll, ?wait=55) сервер «тримав» і віддав тривогу.
    calls = []

    async def responder(method, url, data):
        calls.append(str(url))
        from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMockResponse
        if "wait=" not in str(url):
            return AiohttpClientMockResponse(method, url, json=body(), headers={"ETag": '"e1"'})
        if sum("wait=55" in u for u in calls) == 1:
            return AiohttpClientMockResponse(method, url, json=body(alerting()), headers={"ETag": '"e2"', "X-Wait": "55"})
        await asyncio.sleep(0.5)   # «тримає» запит
        return AiohttpClientMockResponse(method, url, status=304, headers={"ETag": '"e2"', "X-Wait": "55"})

    aioclient_mock.clear_requests()
    aioclient_mock.get(API_URL, side_effect=responder)
    assert await hass.config_entries.async_setup(entry.entry_id)
    for _ in range(20):
        await hass.async_block_till_done()
        if started:
            break
        await asyncio.sleep(0.05)
    assert [e.data["level"] for e in started] == ["red"]
    assert hass.states.get("binary_sensor.irpin_air_raid_alert").state == "on"
    assert any("wait=55" in u for u in calls)
    # Long-poll живий — запасне опитування не ходить у мережу.
    n = len(calls)
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=31))
    await hass.async_block_till_done()
    assert all("wait=55" in u for u in calls[n:])
    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_old_server_without_wait_stays_on_polling(hass: HomeAssistant, aioclient_mock):
    entry = await setup(hass, aioclient_mock)
    await hass.async_block_till_done()
    assert entry.runtime_data.client.waits is False
    assert entry.runtime_data.live_at == 0.0


async def test_power_intervals_for_the_card(hass: HomeAssistant, aioclient_mock):
    # Картка малює смугу світла на добу з цих атрибутів: відключення наперед і до коли графік відомий.
    await setup(hass, aioclient_mock)
    a = hass.states.get("sensor.irpin_power").attributes
    iso = lambda t: dt_util.utc_from_timestamp(t).isoformat()
    assert a["intervals"] == [{"start": iso(NOW + 7200), "end": iso(NOW + 14400), "state": "off"},
                              {"start": iso(NOW + 30000), "end": iso(NOW + 33600), "state": "maybe"}]
    assert a["known_until"] == iso(NOW + 50000)


async def test_card_served_and_added_to_frontend(hass: HomeAssistant, aioclient_mock, hass_client):
    # Картку не треба ставити окремо: інтеграція віддає файл і додає його в кожну сторінку фронтенду.
    from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
    from homeassistant.setup import async_setup_component

    from custom_components.notchalert.card import CARD_PATH, card_url

    assert await async_setup_component(hass, "http", {})
    hass.data.setdefault(DATA_EXTRA_MODULE_URL, set())  # frontend без збірки фронтенду в тестах
    await setup(hass, aioclient_mock)
    assert card_url() in hass.data[DATA_EXTRA_MODULE_URL]
    assert "?v=" in card_url()
    resp = await (await hass_client()).get(CARD_PATH)
    assert resp.status == 200
    assert "notchalert-card" in await resp.text()
