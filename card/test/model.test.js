// Слова й смуга картки на станах у формі справжніх сутностей інтеграції. `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import * as M from "../src/model.js";

const UK = M.strings("uk");
const EN = M.strings("en");
// 05.11.2026 14:30 за Києвом (UTC+2).
const NOW = Date.parse("2026-11-05T12:30:00Z");
const at = (h, m = 0, day = 5) => Date.UTC(2026, 10, day, h - 2, m);
const iso = (ms) => new Date(ms).toISOString();

function hass({ alert = "off", attrs = {}, near = "off", power = null, change = null, sky = "0" } = {}) {
  const ent = (k, id) => ({ entity_id: id, device_id: "dev1", platform: "notchalert", translation_key: k });
  const entities = Object.fromEntries([
    ["alert", "binary_sensor.irpin_air_raid_alert"], ["last_clear", "sensor.irpin_last_all_clear"],
    ["drone_near", "binary_sensor.irpin_drone_nearby"], ["sky_targets", "sensor.irpin_targets_over_the_oblast"],
    ...(power ? [["power_state", "sensor.irpin_power"], ["power_change", "sensor.irpin_power_change"]] : []),
  ].map(([k, id]) => [id, ent(k, id)]));
  const states = {
    "binary_sensor.irpin_air_raid_alert": { state: alert, attributes: attrs },
    "sensor.irpin_last_all_clear": { state: iso(at(9, 15)), attributes: {} },
    "binary_sensor.irpin_drone_nearby": { state: near, attributes: near === "on" ? { km: 4, detail: "Буча · 4 км" } : {} },
    "sensor.irpin_targets_over_the_oblast": { state: sky, attributes: { approach: 2, away: 0, shot_down: 1 } },
  };
  if (power) {
    states["sensor.irpin_power"] = { state: power.state, attributes: power.attributes };
    states["sensor.irpin_power_change"] = { state: change ? iso(change) : "unknown", attributes: {} };
  }
  return { entities, states, devices: { dev1: { name: "Ірпінь" } } };
}

test("червона тривога: заголовок, скільки триває, загрози, дрон поруч", () => {
  const h = hass({ alert: "on", attrs: { level: "red", threats: ["drone", "ballistic"], since: iso(at(13, 5)) }, near: "on" });
  const s = M.read(h, "dev1", NOW);
  assert.equal(s.level, "red");
  assert.deepEqual(s.threats, ["ballistic", "drone"]); // найважча перша, як у нотчі
  assert.equal(M.levelTitle(s, NOW, UK), "Червоний рівень");
  assert.deepEqual(M.levelSub(s, NOW, UK), { since: "з 13:05", lasted: "1 год 25 хв" });
  assert.equal(M.nearLine(s.near, UK), "Дрон поруч · Буча · 4 км");
  assert.equal(M.nearLine({ km: 2.5, detail: null }, EN), "Drone nearby · 2.5 km");
  assert.equal(M.skyLine({ targets: 5, approach: 2, shot: 0 }, UK), "5 цілей над областю · 2 до нас");
  assert.equal(M.skyLine({ targets: 2, approach: 0, shot: 1 }, UK), "2 цілі над областю · збито 1");
});

test("тихо: слово дня з апки й час відбою; без даних — не «тихо»", () => {
  const s = M.read(hass(), "dev1", NOW);
  assert.equal(s.level, "green");
  assert.equal(M.levelTitle(s, NOW, UK), "Тихо"); // 05.11.2026: день ери 739925 % 4 == 1
  assert.deepEqual(M.levelSub(s, NOW, UK), { since: "відбій о 09:15", lasted: null });
  const h = hass();
  h.states["binary_sensor.irpin_air_raid_alert"].state = "unavailable";
  assert.equal(M.levelTitle(M.read(h, "dev1", NOW), NOW, EN), "No data");
});

test("світло є до відключення: заголовок, відлік, тривалість, жар", () => {
  const p = { state: "on", attributes: { group: "3.1", known_until: iso(at(0, 0, 7)),
    intervals: [{ start: iso(at(17)), end: iso(at(21)), state: "off" }, { start: iso(at(8, 0, 6)), end: iso(at(11, 30, 6)), state: "maybe" }] } };
  const s = M.read(hass({ power: p, change: at(17) }), "dev1", NOW);
  const l = M.powerLines(s.power, NOW, UK, true);
  assert.equal(l.headline, "Світло є до 17:00");
  assert.equal(l.detail, "вимкнуть на 4 год");
  assert.equal(l.countdown, "2:30:00");
  assert.equal(l.heat, 0);
  assert.equal(M.powerLines(s.power, at(16, 10), UK, true).heat, 2);
  assert.equal(M.powerLines(s.power, at(16, 45), UK, true).heat, 3);
  // Відключення вже почалось, а сутність ще не оновилась: картка знає з інтервалів.
  const off = M.powerLines(s.power, at(18), EN, false);
  assert.equal(off.headline, "No power until 21:00");
  assert.equal(off.detail, "then power until tomorrow 08:00");
});

test("смуга: години від поточної, відключення й «можливо», далі графіка нема — не світло", () => {
  const p = { intervals: [{ start: at(17), end: at(21), state: "off" }, { start: at(23), end: at(24 + 1), state: "maybe" }], knownUntil: at(24) };
  const st = M.strip(p, NOW);
  assert.equal(st.cells.length, 24);
  assert.equal(st.start, at(14));
  assert.deepEqual(st.cells.slice(0, 3), ["on", "on", "on"]);      // 14, 15, 16
  assert.deepEqual(st.cells.slice(3, 7), ["off", "off", "off", "off"]); // 17–21
  assert.equal(st.cells[9], "maybe");                               // 23
  assert.ok(st.cells.slice(10).every((k) => k === "unknown"));      // з 24:00 графіка ще нема
  assert.deepEqual(st.edges.map((e) => e.text), ["17:00", "21:00", "23:00", "24:00"]);
  assert.ok(Math.abs(st.now - 0.5 / 24) < 1e-9);
});

test("смуга без known_until (сервер до 05.11): не далі кінця доби", () => {
  const st = M.strip({ intervals: [], knownUntil: null }, NOW);
  assert.equal(st.cells.filter((k) => k === "on").length, 10); // 14:00–24:00
});

test("підписи смуги не налазять один на одного", () => {
  const e = [0.1, 0.12, 0.3, 0.5, 0.55, 0.99].map((x) => ({ x }));
  assert.deepEqual(M.spaced(e, 0.15).map((x) => x.x), [0.1, 0.3, 0.5]);
});

test("кінець опівночі — 24:00, завтра — «завтра», тривалості", () => {
  assert.equal(M.when(at(0, 0, 6), NOW, UK, true), "24:00");
  assert.equal(M.when(at(8, 0, 6), NOW, UK), "завтра 08:00");
  assert.equal(M.outageLength(5400, UK, true), "1,5 год");
  assert.equal(M.outageLength(1800, EN, false), "30 min");
  assert.equal(M.countdown(59), "0:59");
  assert.equal(M.plural(UK.sky, 21, true), "21 ціль над областю");
  assert.equal(M.plural(UK.sky, 12, true), "12 цілей над областю");
});
