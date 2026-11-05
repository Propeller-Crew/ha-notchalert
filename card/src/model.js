// Що показує картка: стан пристрою інтеграції, перекладений у слова й смугу. Без DOM, щоб перевірялось у node
// (`npm test`). Слова — ті самі, що в нотчі мака й на острівці (AlertCore/OutageAlerts.swift, English.swift).

export const TZ = "Europe/Kyiv";
export const THREATS = ["massive", "ballistic", "cruise", "mig", "kab", "aircraft", "drone"];

const UK = {
  calm: ["Тривоги немає", "Тихо", "Спокійно", "Все спокійно"],
  yellow: "Жовтий рівень",
  red: "Червоний рівень",
  unknown: "Немає даних",
  since: "з {0}",
  clear: "відбій о {0}",
  noThreats: "Загроз не видно",
  noType: "Тип загрози не повідомляли",
  threat: { massive: "Масована атака", ballistic: "Балістика", cruise: "Ракети", mig: "МіГ-31К", kab: "КАБи", aircraft: "Авіація", drone: "Дрони" },
  near: "Дрон поруч",
  km: "{0} км",
  min: "{0} хв",
  hour: "{0} год",
  hourMin: "{0} год {1} хв",
  tomorrow: "завтра {0}",
  powerOn: "Світло є до {0}",
  powerOnOpen: "Світло є, відключень у графіку більше немає",
  powerOff: "Світла немає до {0}",
  maybe: "Можливе відключення до {0}",
  powerUnknown: "Графіка на сьогодні ще немає",
  offFor: "вимкнуть на {0}",
  thenOn: "потім світло до {0}",
  queue: "черга {0}",
  sky: ["{0} ціль над областю", "{0} цілі над областю", "{0} цілей над областю"],
  approach: "{0} до нас",
  shot: "збито {0}",
  noDevice: "Додайте інтеграцію «Тривога в нотчі», і картка покаже тривогу й світло вашого місця.",
  editor: { device: "Місце", layout: "Вигляд", auto: "Сам за шириною", compact: "Компактний", wide: "Широкий", light: "Світло", sky: "Цілі над областю" },
  cardDescription: "Тривога, загрози, дрон поруч і світло вашого місця, як у нотчі.",
};

const EN = {
  calm: ["No alert", "Quiet", "Calm", "All calm"],
  yellow: "Yellow level",
  red: "Red level",
  unknown: "No data",
  since: "since {0}",
  clear: "all clear at {0}",
  noThreats: "No threats seen",
  noType: "Threat type not reported",
  threat: { massive: "Massive attack", ballistic: "Ballistic", cruise: "Missiles", mig: "MiG-31K", kab: "Guided bombs", aircraft: "Aircraft", drone: "Drones" },
  near: "Drone nearby",
  km: "{0} km",
  min: "{0} min",
  hour: "{0} h",
  hourMin: "{0} h {1} min",
  tomorrow: "tomorrow {0}",
  powerOn: "Power on until {0}",
  powerOnOpen: "Power on, no more outages scheduled",
  powerOff: "No power until {0}",
  maybe: "Possible outage until {0}",
  powerUnknown: "No schedule for today yet",
  offFor: "off for {0}",
  thenOn: "then power until {0}",
  queue: "queue {0}",
  sky: ["{0} target over the oblast", "{0} targets over the oblast", "{0} targets over the oblast"],
  approach: "{0} heading our way",
  shot: "{0} shot down",
  noDevice: "Add the NotchAlert integration, and the card shows the alert and the power of your place.",
  editor: { device: "Place", layout: "Layout", auto: "By width", compact: "Compact", wide: "Wide", light: "Power", sky: "Targets over the oblast" },
  cardDescription: "Alert, threats, drone nearby and power for your place, as in the notch.",
};

export function strings(lang) {
  return String(lang || "").toLowerCase().startsWith("uk") ? UK : EN;
}

export function fmt(s, ...args) {
  return s.replace(/\{(\d)\}/g, (_, i) => String(args[+i]));
}

/** 1 ціль, 2 цілі, 5 цілей (англійська: 1 target, 2 targets). */
export function plural(forms, n, uk) {
  const m10 = n % 10, m100 = n % 100;
  const i = !uk ? (n === 1 ? 0 : 1) : m10 === 1 && m100 !== 11 ? 0 : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 1 : 2;
  return fmt(forms[i], n);
}

// ---------------------------------------------------------------------------------------------
// Час за Києвом: графіки й тривоги в Україні, хоч де стоїть сервер Home Assistant.
// ---------------------------------------------------------------------------------------------

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function kyiv(ms) {
  const p = Object.fromEntries(parts.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute };
}

const dayKey = (k) => k.y * 10000 + k.mo * 100 + k.d;
const pad = (n) => String(n).padStart(2, "0");

/** «14:00»; кінець опівночі — «24:00», щоб «до 24:00» не читалось як цей ранок (як `OutageStatus.hhmm`). */
export function hhmm(ms, end = false) {
  const k = kyiv(ms);
  return `${pad(end && k.h === 0 && k.mi === 0 ? 24 : k.h)}:${pad(k.mi)}`;
}

/** «14:00» сьогодні, «завтра 08:00» завтра (`OutageStatus.when`). */
export function when(ms, now, t, end = false) {
  const k = kyiv(end ? ms - 1 : ms);
  const today = kyiv(now), tomorrow = kyiv(now + 86400000);
  if (dayKey(k) === dayKey(today)) return hhmm(ms, end);
  if (dayKey(k) === dayKey(tomorrow)) return fmt(t.tomorrow, hhmm(ms, end));
  return `${k.d}.${pad(k.mo)} ${hhmm(ms, end)}`;
}

/** «1 год 12 хв», «45 хв», «3 год». */
export function lasted(seconds, t) {
  const m = Math.max(0, Math.floor(seconds / 60));
  if (m < 60) return fmt(t.min, m);
  const h = Math.floor(m / 60), r = m % 60;
  return r ? fmt(t.hourMin, h, r) : fmt(t.hour, h);
}

/** «3 год», «1,5 год», «30 хв»: тривалість відключення півгодинами, як `OutageStatus.duration`. */
export function outageLength(seconds, t, uk) {
  const m = Math.round(seconds / 60);
  if (m < 60) return fmt(t.min, m);
  const halves = Math.round(m / 30);
  const h = halves % 2 ? `${Math.floor(halves / 2)}${uk ? "," : "."}5` : String(halves / 2);
  return fmt(t.hour, h);
}

/** Відлік «2:14:05», як `Text(timerInterval:)` на острівці. */
export function countdown(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
}

/** Слово дня для «тихо»: те саме, що в апці того самого дня (`AlertLevel.calmTitle`, порядковий день ери). */
export function calmTitle(now, t) {
  const k = kyiv(now);
  const ordinal = Math.floor(Date.UTC(k.y, k.mo - 1, k.d) / 86400000) + 719163;
  return t.calm[ordinal % t.calm.length];
}

// ---------------------------------------------------------------------------------------------
// Стан пристрою з сутностей інтеграції. Сутності шукаємо за translation_key, а не за entity_id:
// id залежать від мови Home Assistant і назви місця.
// ---------------------------------------------------------------------------------------------

export function devices(hass) {
  const ids = new Set(Object.values(hass?.entities || {}).filter((e) => e.platform === "notchalert").map((e) => e.device_id));
  return [...ids].filter(Boolean).map((id) => ({ id, name: deviceName(hass, id) }));
}

export function deviceName(hass, id) {
  const d = hass?.devices?.[id];
  return d?.name_by_user || d?.name || "";
}

export function entitiesOf(hass, deviceId) {
  const out = {};
  for (const e of Object.values(hass?.entities || {})) {
    if (e.platform === "notchalert" && e.device_id === deviceId && e.translation_key) out[e.translation_key] = e.entity_id;
  }
  return out;
}

const ms = (v) => {
  const n = Date.parse(v);
  return Number.isFinite(n) ? n : null;
};
const live = (s) => s && s.state !== "unavailable";

/** Усе, що картка малює, одним об'єктом. `now` — мс. */
export function read(hass, deviceId, now) {
  const ids = entitiesOf(hass, deviceId);
  const st = (k) => (ids[k] ? hass.states[ids[k]] : undefined);
  const alert = st("alert");
  const out = { ids, name: deviceName(hass, deviceId), level: "unknown", threats: [], since: null, reason: null };
  if (live(alert)) {
    const on = alert.state === "on";
    const a = alert.attributes || {};
    out.level = on ? (a.level === "red" ? "red" : "yellow") : "green";
    out.threats = on ? THREATS.filter((k) => (a.threats || []).includes(k)) : [];
    out.since = on ? ms(a.since) : null;
    out.reason = on ? a.reason || null : null;
  }
  const clear = st("last_clear");
  out.lastClear = live(clear) ? ms(clear.state) : null;

  const near = st("drone_near");
  out.near = live(near) && near.state === "on" ? { km: near.attributes?.km ?? null, detail: near.attributes?.detail || null } : null;

  const sky = st("sky_targets");
  out.sky = live(sky) && Number(sky.state) > 0
    ? { targets: Number(sky.state), approach: sky.attributes?.approach || 0, shot: sky.attributes?.shot_down || 0 }
    : null;

  const ps = st("power_state");
  if (ps) {
    const a = ps.attributes || {};
    const change = st("power_change");
    out.power = {
      available: live(ps),
      state: live(ps) ? ps.state : "unavailable",
      group: a.group || null,
      until: live(change) ? ms(change.state) : null,
      intervals: (a.intervals || []).map((iv) => ({ start: ms(iv.start), end: ms(iv.end), state: iv.state })).filter((iv) => iv.start && iv.end),
      knownUntil: ms(a.known_until),
    };
  } else {
    out.power = null;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Слова для заголовків
// ---------------------------------------------------------------------------------------------

export function levelTitle(s, now, t) {
  return s.level === "green" ? calmTitle(now, t) : s.level === "unknown" ? t.unknown : t[s.level];
}

/** Під заголовком: скільки триває тривога, або коли був відбій. */
export function levelSub(s, now, t) {
  if (s.since) {
    const k = kyiv(s.since), today = kyiv(now);
    const at = dayKey(k) === dayKey(today) ? hhmm(s.since) : `${k.d}.${pad(k.mo)}`;
    return { since: fmt(t.since, at), lasted: lasted((now - s.since) / 1000, t) };
  }
  if (s.level === "green" && s.lastClear) {
    const k = kyiv(s.lastClear), today = kyiv(now);
    const at = dayKey(k) === dayKey(today) ? hhmm(s.lastClear) : `${k.d}.${pad(k.mo)} ${hhmm(s.lastClear)}`;
    return { since: fmt(t.clear, at), lasted: null };
  }
  return null;
}

/** «Дрон поруч · Буча · 4 км». Відстань з рядка сервера; нема в рядку — з атрибута km. */
export function nearLine(near, t) {
  if (!near) return null;
  const bits = [t.near];
  if (near.detail) bits.push(near.detail);
  if (near.km != null && !/\d\s*(км|km)/.test(near.detail || "")) bits.push(fmt(t.km, String(near.km).replace(".", t === UK ? "," : ".")));
  return bits.join(" · ");
}

export function skyLine(sky, t) {
  if (!sky) return null;
  const uk = t === UK;
  const bits = [plural(t.sky, sky.targets, uk)];
  if (sky.approach) bits.push(fmt(t.approach, sky.approach));
  if (sky.shot) bits.push(fmt(t.shot, sky.shot));
  return bits.join(" · ");
}

// ---------------------------------------------------------------------------------------------
// Світло
// ---------------------------------------------------------------------------------------------

/** До коли графік відомий: від сервера (`known_until`), а без нього — до кінця відомих інтервалів, але не
 *  далі цієї доби. Далі смуга не малює світло, наче його обіцяли. */
export function horizon(p, now) {
  if (p.knownUntil) return p.knownUntil;
  const k = kyiv(now);
  let midnight = now + ((24 - k.h) * 60 - k.mi) * 60000;
  midnight -= midnight % 60000;
  const last = Math.max(0, ...p.intervals.map((iv) => iv.end));
  return Math.max(midnight, last);
}

/** Поточне відключення чи наступне, як `OutageStatus`: що зараз, до коли, і що після. */
export function powerLines(p, now, t, uk) {
  if (!p) return null;
  const off = p.intervals;
  const cur = off.find((iv) => iv.start <= now && now < iv.end);
  let state = p.state, until = p.until;
  if (cur) {
    state = cur.state;
    until = cur.end;
  } else if (state === "off" || state === "maybe") {
    state = "on"; // сутність ще не оновилась після кінця відключення: смуга й так знає, що воно скінчилось
  }
  if (state === "on" && !cur) until = off.find((iv) => iv.start > now)?.start ?? (until && until > now ? until : null);
  let headline, detail = null;
  if (state === "unavailable") headline = t.unknown;
  else if (state === "unknown") headline = t.powerUnknown;
  else if (state === "on") {
    headline = until ? fmt(t.powerOn, when(until, now, t)) : t.powerOnOpen;
    const next = until && off.find((iv) => iv.start === until);
    if (next) detail = fmt(t.offFor, outageLength((next.end - next.start) / 1000, t, uk));
  } else {
    headline = fmt(state === "maybe" ? t.maybe : t.powerOff, when(until, now, t, true));
    const after = off.find((iv) => iv.start > until);
    if (after) detail = fmt(t.thenOn, when(after.start, now, t));
  }
  // Жовтий, а коли відключення близько — помаранчевий (90 хв) і червоний (30 хв), як `OutageStatus.heat`.
  const left = until ? (until - now) / 60000 : Infinity;
  const heat = state === "on" && until ? (left <= 30 ? 3 : left <= 90 ? 2 : 0) : 0;
  return { state, until, headline, detail, heat, countdown: until && until > now ? countdown((until - now) / 1000) : null };
}

/** Смуга на добу наперед: клітинки по годині від поточної, як `InkDayStrip`, і часи перемикань під нею. */
export function strip(p, now, hours = 24) {
  const k = kyiv(now);
  const start = now - (k.mi * 60000) - (now % 60000);
  const end = start + hours * 3600000;
  const known = horizon(p, now);
  const kindAt = (t) => {
    if (t >= known) return "unknown";
    const iv = p.intervals.find((x) => x.start <= t && t < x.end);
    return iv ? iv.state : "on";
  };
  const cells = Array.from({ length: hours }, (_, i) => kindAt(start + (i + 0.5) * 3600000));
  const edges = [];
  for (const iv of p.intervals) {
    for (const [at, isEnd] of [[iv.start, false], [iv.end, true]]) {
      if (at > start && at < end && at <= known && !edges.some((e) => e.at === at)) {
        edges.push({ at, x: (at - start) / (end - start), text: hhmm(at, isEnd), kind: isEnd ? "on" : iv.state });
      }
    }
  }
  if (known > start && known < end && !edges.some((e) => e.at === known)) {
    edges.push({ at: known, x: (known - start) / (end - start), text: hhmm(known, true), kind: "unknown" });
  }
  edges.sort((a, b) => a.at - b.at);
  return { start, end, cells, now: (now - start) / (end - start), edges };
}

/** Підписи, що не налазять один на одного: `gap` — частка ширини на підпис. Що не влізло — пропускаємо. */
export function spaced(edges, gap) {
  const out = [];
  for (const e of edges) {
    if (e.x < 0.02 || e.x > 0.98) continue;
    if (out.length && e.x - out[out.length - 1].x < gap) continue;
    out.push(e);
  }
  return out;
}
