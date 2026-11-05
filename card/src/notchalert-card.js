// Картка «Тривоги в нотчі» для панелі Home Assistant (05.11, Артем: «красиве для хас»). Вигляд — картка нотча мака
// й віджети айфона: рівень кольором і формою, скільки триває, загрози силуетами, «дрон поруч», смуга світла на добу.
// Інтеграція сама реєструє цей файл у фронтенді (__init__.py), тож окремо ставити нічого не треба.

import { LitElement, html, css, svg, nothing } from "lit";
import { ICONS } from "./icons.js";
import * as M from "./model.js";

const VERSION = __CARD_VERSION__; // з manifest.json, build.mjs
const WIDE = 560; // px ширини картки, з якої алерт і світло стають поруч (планшет на стіні)

function threatIcon(kind, cls = "") {
  const i = ICONS[kind];
  if (!i) return nothing;
  return html`<svg class="ti ${cls} ${kind}" viewBox="0 0 100 100" aria-hidden="true">${svg`<path d=${i.d} fill-rule="nonzero" transform=${i.rotate ? `rotate(${i.rotate} 50 50)` : ""}></path>`}</svg>`;
}

/** Червоний — трикутник, жовтий — повний круг, зелений — кільце, без даних — сіре кільце (`StatusDot`): рівень
 *  читається й без кольору. */
function levelMark(level) {
  if (level === "red") return html`<svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5 L19 18 L1 18 Z"></path></svg>`;
  const hollow = level !== "yellow";
  return html`<svg class="mark ${hollow ? "hollow" : ""}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r=${hollow ? 7.5 : 9}></circle></svg>`;
}

class NotchAlertCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _now: { state: true },
    _wide: { state: true },
    _width: { state: true },
  };

  static getConfigElement() {
    return document.createElement("notchalert-card-editor");
  }

  static getStubConfig(hass) {
    const d = M.devices(hass)[0];
    return d ? { device_id: d.id } : {};
  }

  setConfig(config) {
    this._config = { layout: "auto", light: true, sky: true, ...(config || {}) };
  }

  getCardSize() {
    return this._wide ? 4 : 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback() {
    super.connectedCallback();
    this._now = Date.now();
    // Раз на секунду: відлік світла йде секундами, як на острівці. Решта картки від цього не перемальовується
    // дорожче за кілька рядків тексту.
    this._timer = setInterval(() => (this._now = Date.now()), 1000);
    this._ro = new ResizeObserver(([e]) => {
      this._width = e.contentRect.width;
      this._wide = this._width >= WIDE;
    });
    this.updateComplete.then(() => this._ro?.observe(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._ro?.disconnect();
  }

  get _deviceId() {
    return this._config?.device_id || M.devices(this.hass)[0]?.id;
  }

  _more(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const t = M.strings(this.hass.locale?.language || this.hass.language);
    const uk = t === M.strings("uk");
    const dark = !!this.hass.themes?.darkMode;
    const id = this._deviceId;
    if (!id) return html`<ha-card class="empty ${dark ? "dark" : "light"}"><div class="hint">${t.noDevice}</div></ha-card>`;
    const now = this._now || Date.now();
    const s = M.read(this.hass, id, now);
    const layout = this._config.layout === "auto" ? (this._wide ? "wide" : "compact") : this._config.layout;
    const power = this._config.light !== false && s.power ? s.power : null;
    return html`
      <ha-card class="${layout} lvl-${s.level} ${dark ? "dark" : "light"} ${power ? "has-power" : ""}">
        <div class="sky"></div>
        <div class="body">
          ${this._alert(s, now, t, uk)}
          ${power ? this._light(power, now, t, uk, layout) : nothing}
        </div>
      </ha-card>
    `;
  }

  _alert(s, now, t, uk) {
    const sub = M.levelSub(s, now, t);
    const near = M.nearLine(s.near, t);
    // «Дрон поруч» з місцем і відстанню вже каже про дрони: окремий значок «Дрони» поруч з ним — повтор.
    const threats = s.threats.filter((k) => !(near && k === "drone"));
    const sky = this._config.sky !== false ? M.skyLine(s.sky, t) : null;
    let quietLine = null;
    if (!threats.length && !near && s.level !== "unknown") quietLine = s.level === "green" ? t.noThreats : s.reason ? null : t.noType;
    return html`
      <section class="alert" @click=${() => this._more(s.ids.alert)}>
        <div class="top">
          ${levelMark(s.level)}
          <span class="place">${s.name}</span>
        </div>
        <div class="title">${M.levelTitle(s, now, t)}</div>
        ${sub
          ? html`<div class="sub">${sub.since}${sub.lasted ? html`<span class="dot">·</span><b>${sub.lasted}</b>` : nothing}</div>`
          : nothing}
        ${s.reason ? html`<div class="reason">${s.reason}</div>` : nothing}
        ${threats.length
          ? html`<div class="threats">
              ${threats.map((k) => html`<span class="chip">${threatIcon(k)}<span>${t.threat[k]}</span></span>`)}
            </div>`
          : nothing}
        ${near ? html`<div class="near">${threatIcon("drone")}<span>${near}</span></div>` : nothing}
        ${quietLine ? html`<div class="quiet">${quietLine}</div>` : nothing}
        ${sky ? html`<div class="skyline">${sky}</div>` : nothing}
      </section>
    `;
  }

  _light(p, now, t, uk, layout) {
    const l = M.powerLines(p, now, t, uk);
    const known = p.available && l.state !== "unknown";
    const st = known ? M.strip(p, now) : null;
    // Підпис «21:00» — близько 40 px; ширина смуги — пів картки поруч з тривогою або вся картка без 36 px полів.
    const w = this._width || 360;
    const stripWidth = layout === "wide" ? w / 2 - 60 : w - 36;
    const labels = st ? M.spaced(st.edges, 42 / Math.max(stripWidth, 120)) : [];
    const lit = l.state === "on" || l.state === "unavailable";
    return html`
      <section class="power st-${l.state} heat-${l.heat}" @click=${() => this._more(this._entity("power_state"))}>
        <div class="ptop">
          <ha-icon icon=${lit ? "mdi:flash" : "mdi:flash-off"}></ha-icon>
          ${p.group ? html`<span class="queue">${M.fmt(t.queue, p.group)}</span>` : nothing}
        </div>
        <div class="headline">${l.headline}</div>
        ${l.countdown ? html`<div class="count">${l.countdown}</div>` : nothing}
        ${l.detail ? html`<div class="pdetail">${l.detail}</div>` : nothing}
        ${st
          ? html`<div class="strip">
                <div class="cells">${st.cells.map((k) => html`<i class="c-${k}"></i>`)}</div>
                <div class="now" style="left:${(st.now * 100).toFixed(2)}%"></div>
              </div>
              <div class="labels">
                ${labels.map(
                  (e) => html`<span class="lb k-${e.kind}" style="left:${(e.x * 100).toFixed(2)}%">${e.text}</span>`,
                )}
              </div>`
          : nothing}
      </section>
    `;
  }

  _entity(key) {
    return M.entitiesOf(this.hass, this._deviceId)[key];
  }

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      position: relative;
      overflow: hidden;
      height: 100%;
      box-sizing: border-box;
      cursor: pointer;
      /* Кольори рівня й світла — нотча на темному й глибші на світлому, де жовтий острівця не читається
         (WidgetLook.swift, Ink). */
      --na-green: #33d659;
      --na-yellow: #ffd10a;
      --na-red: #ff3b30;
      --na-grey: #808080;
      --na-on: #ffcc33;
      --na-warm: #ff8c26;
      --na-hot: #ff453b;
      --na-tile: rgba(255, 255, 255, 0.1);
      --na-unknown: rgba(255, 255, 255, 0.04);
      --na-text: var(--primary-text-color);
      --na-secondary: var(--secondary-text-color);
      --na-sky: 0.24;
    }
    ha-card.light {
      --na-green: #1a993d;
      --na-yellow: #c78c00;
      --na-red: #db2921;
      --na-grey: #737373;
      --na-on: #cc8f00;
      --na-warm: #e66b0d;
      --na-hot: #db2921;
      --na-tile: rgba(20, 20, 20, 0.07);
      --na-unknown: rgba(20, 20, 20, 0.03);
      --na-sky: 0.16;
    }
    .lvl-green { --na-level: var(--na-green); }
    .lvl-yellow { --na-level: var(--na-yellow); }
    .lvl-red { --na-level: var(--na-red); }
    .lvl-unknown { --na-level: var(--na-grey); }

    /* Небо рівня зверху, як фон віджета айфона (WidgetSkyBackground): видно здалеку, навіть не читаючи. */
    .sky {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, var(--na-level) 0%, transparent 78%);
      opacity: var(--na-sky);
    }
    .lvl-green .sky { opacity: calc(var(--na-sky) * 0.45); }
    .lvl-unknown .sky { opacity: 0.08; }

    .body {
      position: relative;
      display: grid;
      gap: 18px;
      padding: 18px 18px 16px;
    }
    .wide .body {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 28px;
      padding: 24px 26px 22px;
    }
    .compact.has-power .power {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      padding-top: 16px;
    }
    .wide.has-power .power {
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      padding-left: 26px;
    }

    .top, .ptop {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 20px;
    }
    .mark {
      width: 14px;
      height: 14px;
      fill: var(--na-level);
      stroke: var(--na-level);
      stroke-width: 0;
      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--na-level) 70%, transparent));
      flex: none;
    }
    .mark.hollow { fill: none; stroke-width: 3; filter: none; }
    .place, .queue {
      margin-left: auto;
      font-size: 13px;
      font-weight: 500;
      color: var(--na-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title {
      margin-top: 10px;
      font-size: 30px;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--na-level);
    }
    .wide .title { font-size: 40px; margin-top: 14px; }
    .sub {
      margin-top: 6px;
      font-size: 15px;
      color: var(--na-secondary);
      font-variant-numeric: tabular-nums;
    }
    .sub b { color: var(--na-text); font-weight: 600; }
    .wide .sub { font-size: 17px; }
    .dot { margin: 0 6px; opacity: 0.6; }
    .reason {
      margin-top: 4px;
      font-size: 13px;
      color: var(--na-secondary);
    }

    .threats {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 7px;
      border-radius: 10px;
      background: var(--na-tile);
      font-size: 14px;
      font-weight: 600;
      color: var(--na-text);
    }
    .wide .chip { font-size: 16px; padding: 8px 14px 8px 9px; }
    .ti {
      width: 18px;
      height: 18px;
      fill: var(--na-text);
      flex: none;
    }
    .wide .ti { width: 22px; height: 22px; }
    .ti.massive { fill: var(--na-yellow); }
    .light .ti.massive { fill: var(--na-red); }

    /* «Дрон поруч» — найближча загроза, тож тонований рівнем рядок, а не ще один значок. */
    .near {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--na-level) 16%, transparent);
      font-size: 15px;
      font-weight: 600;
      color: var(--na-text);
    }
    .lvl-green .near { background: color-mix(in srgb, var(--na-red) 14%, transparent); }
    .wide .near { font-size: 17px; }
    .near .ti { width: 20px; height: 20px; }
    .quiet, .skyline {
      margin-top: 12px;
      font-size: 14px;
      color: var(--na-secondary);
    }
    .skyline { font-size: 13px; }

    .power ha-icon {
      --mdc-icon-size: 22px;
      color: var(--na-on);
    }
    .power.heat-2 ha-icon { color: var(--na-warm); }
    .power.heat-3 ha-icon { color: var(--na-hot); }
    .power.st-off ha-icon, .power.st-unknown ha-icon, .power.st-unavailable ha-icon { color: var(--na-secondary); }
    .power.st-maybe ha-icon { color: color-mix(in srgb, var(--na-on) 60%, transparent); }
    .queue { margin-left: auto; }
    .headline {
      margin-top: 8px;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 700;
      color: var(--na-text);
    }
    .wide .headline { font-size: 24px; margin-top: 14px; }
    .count {
      margin-top: 4px;
      font-size: 15px;
      font-weight: 500;
      color: var(--na-secondary);
      font-variant-numeric: tabular-nums;
    }
    .wide .count { font-size: 17px; }
    .pdetail {
      margin-top: 2px;
      font-size: 13px;
      color: var(--na-secondary);
    }

    .strip {
      position: relative;
      margin-top: 14px;
      height: 12px;
    }
    .wide .strip { height: 16px; margin-top: 20px; }
    .cells {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      height: 100%;
    }
    .cells i { border-radius: 3px; }
    .c-on { background: var(--na-on); }
    .c-maybe { background: color-mix(in srgb, var(--na-on) 55%, transparent); }
    .c-off { background: var(--na-tile); }
    /* Далі графіка ще нема: не світло й не темрява, а штрих, як «невідомо» на смузі апки. */
    .c-unknown {
      background: repeating-linear-gradient(135deg, var(--na-tile) 0 1.5px, transparent 1.5px 5px);
    }
    .now {
      position: absolute;
      top: -3px;
      bottom: -3px;
      width: 2px;
      margin-left: -1px;
      border-radius: 1px;
      background: var(--na-text);
    }
    .labels {
      position: relative;
      height: 14px;
      margin-top: 4px;
    }
    .lb {
      position: absolute;
      transform: translateX(-50%);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--na-secondary);
    }
    .lb.k-off { color: var(--na-text); font-weight: 600; }
    .lb.k-on { color: var(--na-on); font-weight: 600; }
    .lb.k-unknown { opacity: 0.7; }
    .wide .lb { font-size: 12px; }

    .hint {
      padding: 18px;
      color: var(--na-secondary);
      font-size: 14px;
    }
  `;
}

// ---------------------------------------------------------------------------------------------
// Редактор: місце зі списку пристроїв інтеграції, вигляд, світло й цілі. Без YAML.
// ---------------------------------------------------------------------------------------------

class NotchAlertCardEditor extends LitElement {
  static properties = { hass: { attribute: false }, _config: { state: true } };

  setConfig(config) {
    this._config = config;
  }

  connectedCallback() {
    super.connectedCallback();
    // ha-form вантажиться ліниво; у редакторі будь-якої вбудованої картки він уже є.
    if (!customElements.get("ha-form")) window.loadCardHelpers?.().then((h) => h.createCardElement({ type: "entities", entities: [] }).constructor.getConfigElement?.());
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const t = M.strings(this.hass.locale?.language || this.hass.language).editor;
    const schema = [
      { name: "device_id", selector: { device: { integration: "notchalert" } } },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "auto", label: t.auto },
              { value: "compact", label: t.compact },
              { value: "wide", label: t.wide },
            ],
          },
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "light", selector: { boolean: {} } },
          { name: "sky", selector: { boolean: {} } },
        ],
      },
    ];
    const labels = { device_id: t.device, layout: t.layout, light: t.light, sky: t.sky };
    const data = { layout: "auto", light: true, sky: true, ...this._config };
    if (!data.device_id) data.device_id = M.devices(this.hass)[0]?.id;
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(s) => labels[s.name] ?? s.name}
      @value-changed=${this._changed}
    ></ha-form>`;
  }

  _changed(ev) {
    const config = { ...ev.detail.value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

if (!customElements.get("notchalert-card")) {
  customElements.define("notchalert-card", NotchAlertCard);
  customElements.define("notchalert-card-editor", NotchAlertCardEditor);
  // Мова сторінки, коли модуль вантажиться, ще може бути не вибрана (05.11: «нотч» у пошуку карток не знаходив
  // англійську назву). Назва двомовна, як у manifest.json, тож шукається й так, і так; опис — мовою людини.
  let lang = navigator.language;
  try {
    lang = JSON.parse(localStorage.getItem("selectedLanguage")) || lang;
  } catch (e) {
    /* приватне вікно: мова браузера */
  }
  const t = M.strings(lang);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "notchalert-card",
    name: "Тривога в нотчі (NotchAlert)",
    description: t.cardDescription,
    preview: true,
    documentationURL: "https://github.com/Propeller-Crew/ha-notchalert#card",
  });
  console.info(`%c NOTCHALERT-CARD %c ${VERSION} `, "background:#ff3b30;color:#fff;font-weight:700", "background:#222;color:#fff");
}
