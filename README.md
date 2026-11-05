# Тривога в нотчі для Home Assistant

[![Відкрити в HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Propeller-Crew&repository=ha-notchalert&category=integration)
[![Додати інтеграцію](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=notchalert)

Повітряна тривога, загрози й «дрон поруч» для вашого місця у Home Assistant: для світла в коридорі, оголошення
колонкою, ролет. Тривога приходить за секунду. Дані ті самі, що в застосунку
[«Тривога в нотчі»](https://notchalert.propellercrew.com) на iPhone, Android і Mac.

*[English below](#english)*

## Як підключити

1. Натисніть **«Відкрити в HACS»** вище → **Завантажити** → перезапустіть Home Assistant.
2. У застосунку «Тривога в нотчі»: **Налаштування → Home Assistant → Отримати ключ → Скопіювати**.
3. Натисніть **«Додати інтеграцію»** вище (або Налаштування → Пристрої та служби → Додати інтеграцію →
   «Тривога в нотчі») і вставте ключ.

Без HACS: скопіюйте `custom_components/notchalert` у `config/custom_components/` і перезапустіть Home Assistant.

Ключ прив'язаний до місця, вибраного в застосунку. Якщо змінити місце в застосунку, Home Assistant покаже нове.
Після «Видати новий ключ» чи «Вимкнути» старий ключ одразу перестає діяти, і Home Assistant попросить новий.
Ключ нікому не показуйте: з ним видно ваше місце.

<a id="card"></a>
## Картка для панелі

Те саме, що в нотчі на Mac і на острівці iPhone: рівень кольором і формою (червоний трикутник, жовтий круг,
зелене кільце), скільки триває тривога, загрози силуетами, «Дрон поруч · місце · км», цілі над областю й смуга
світла на добу з відліком до перемикання. На телефоні все стовпчиком, на планшеті на стіні тривога й світло
поруч. Темна й світла тема Home Assistant підхоплюються самі.

<p>
  <img src="https://raw.githubusercontent.com/Propeller-Crew/ha-notchalert/main/images/card-phone-dark.png" width="300" alt="Картка на телефоні, темна тема: червоний рівень, балістика, дрон поруч, світло до 21:00">
  <img src="https://raw.githubusercontent.com/Propeller-Crew/ha-notchalert/main/images/card-phone-light.png" width="300" alt="Картка на телефоні, світла тема: тихо, світло до 21:00">
</p>
<img src="https://raw.githubusercontent.com/Propeller-Crew/ha-notchalert/main/images/card-wall-dark.png" width="620" alt="Широка картка для планшета на стіні: тривога зліва, світло справа">

Ставити окремо нічого не треба: картка приходить разом з інтеграцією.

1. Панель → олівець **Редагувати** → **Додати картку** → вкладка **За карткою**.
2. Пошук: «нотч» → **Тривога в нотчі (NotchAlert)**.
3. **Місце** вже вибране (з кількома місцями — виберіть потрібне), **Вигляд** — «Сам за шириною», або
   «Компактний» чи «Широкий». Перемикачі **Світло** й **Цілі над областю** ховають ці рядки. **Зберегти**.

<img src="https://raw.githubusercontent.com/Propeller-Crew/ha-notchalert/main/images/card-editor.png" width="620" alt="Редактор картки: місце, вигляд, світло, цілі над областю">

Натиск на тривогу відкриває історію сутності тривоги, на світло — графік. Смуга світла показує 24 години від
поточної; штрих — години, на які графіка ще нема (не «світло є»). Світло видно, коли в застосунку вибрана черга.

Картка з'явилась у v0.2.0. Якщо після оновлення й перезапуску Home Assistant її немає в списку, оновіть сторінку
браузера або перезапустіть застосунок Home Assistant на телефоні.

## Сутності

Нижче id для місця «Ірпінь» у Home Assistant з англійською системною мовою. З українською id будуть інші
(транслітерація назв): дивіться Налаштування → Пристрої та служби → «Тривога в нотчі».

| Сутність | Що це |
|---|---|
| `binary_sensor.irpin_air_raid_alert` | Повітряна тривога в районі (атрибути `level`, `threats`, `since`, `reason`) |
| `sensor.irpin_alert_level` | `none` / `yellow` / `red` |
| `sensor.irpin_threat` | Найважча загроза: `none`, `massive`, `ballistic`, `cruise`, `mig`, `kab`, `aircraft`, `drone`; усі загрози — в атрибуті `list` і окремими атрибутами так/ні |
| `sensor.irpin_alert_started`, `sensor.irpin_last_all_clear` | Коли почалась тривога і коли був останній відбій |
| `binary_sensor.irpin_drone_nearby`, `sensor.irpin_drone_distance` | Дрон у радіусі від дому й відстань, км (коли застосунок знає місце точно) |
| `sensor.irpin_power`, `binary_sensor.irpin_power_schedule` | Світло за графіком: `on` / `off` / `maybe` / `unknown`; атрибути `group`, `intervals` (відключення й «можливо» наперед), `known_until` (до коли графік відомий) |
| `sensor.irpin_power_changes_at`, `sensor.irpin_next_outage` | Коли світло перемкнеться (атрибут `next`) і коли наступне відключення |
| `sensor.irpin_targets_over_the_oblast` | Скільки цілей над областю (атрибути: до нас, від нас, збито) |

Коли сервер не має свіжих даних, сутності стають `unavailable`, а не «тихо», тож автоматизація на «відбій» від
цього не спрацює.

## Події

| Подія | Дані |
|---|---|
| `notchalert_alert_started` | `place`, `level`, `threats`, `since`, `reason` |
| `notchalert_alert_ended` | `place`, `lasted_min` |
| `notchalert_threat` | `place`, `threat` (нова загроза посеред тривоги), `level` |
| `notchalert_drone_near` | `place`, `km`, `detail` |

## Приклади автоматизацій

Тривога: світло в коридорі червоним і оголошення колонкою.

```yaml
automation:
  - alias: "Тривога: коридор і колонка"
    triggers:
      - trigger: event
        event_type: notchalert_alert_started
    actions:
      - action: light.turn_on
        target: { entity_id: light.hallway }
        data: { color_name: red, brightness_pct: 60 }
      - action: tts.speak
        target: { entity_id: tts.google_translate_uk }
        data:
          media_player_entity_id: media_player.kitchen
          message: "Повітряна тривога. Пройдіть в укриття."
```

Балістика: критичне сповіщення на телефон, навіть уночі.

```yaml
  - alias: "Балістика"
    triggers:
      - trigger: event
        event_type: notchalert_threat
        event_data: { threat: ballistic }
    actions:
      - action: notify.mobile_app_phone
        data:
          title: "Балістика"
          message: "Загроза балістики: {{ trigger.event.data.place }}"
          data: { push: { interruption-level: critical } }
```

Дрон поруч: закрити ролети.

```yaml
  - alias: "Дрон поруч — ролети"
    triggers:
      - trigger: event
        event_type: notchalert_drone_near
    actions:
      - action: cover.close_cover
        target: { entity_id: cover.living_room }
```

Відбій: вимкнути світло й сказати, скільки тривало.

```yaml
  - alias: "Відбій"
    triggers:
      - trigger: event
        event_type: notchalert_alert_ended
    actions:
      - action: light.turn_off
        target: { entity_id: light.hallway }
      - action: notify.mobile_app_phone
        data:
          message: "Відбій. Тривога тривала {{ trigger.event.data.lasted_min }} хв."
```

## Як швидко

Інтеграція тримає відкритий запит до сервера, і той відповідає, щойно стан змінився: тривога приходить за
секунду. Запасне опитування — раз на 30 с. Якщо сервер просить почекати, інтеграція чекає рівно стільки,
скільки він сказав.

---

## English

Air-raid alerts in Ukraine, threats and "drone nearby" for your place in Home Assistant, from the
[NotchAlert](https://notchalert.propellercrew.com) app (iPhone, Android, Mac). Alerts arrive within a second.

### Setup

1. Click **Open in HACS** above → **Download** → restart Home Assistant.
2. In the NotchAlert app: **Settings → Home Assistant → Get key → Copy**.
3. Click **Add integration** above (or Settings → Devices & services → Add integration → NotchAlert) and paste
   the key.

Without HACS: copy `custom_components/notchalert` into `config/custom_components/` and restart.

The key is tied to the place chosen in the app. Change the place in the app, and Home Assistant follows.
"Issue new key" or "Turn off" in the app revokes the old key at once, and Home Assistant asks for the new one.
Keep the key private: it reveals your place.

<a id="card-en"></a>
### Dashboard card

The same as the notch on a Mac and the island on an iPhone: the level by colour and shape, how long the alert
lasts, threats as silhouettes, "Drone nearby · place · km", targets over the oblast and a 24-hour power strip
with a countdown to the next switch. Stacked on a phone, side by side on a wall tablet; follows the dark and
light theme of Home Assistant.

<img src="https://raw.githubusercontent.com/Propeller-Crew/ha-notchalert/main/images/card-wall-light.png" width="620" alt="Wide card, light theme: red level, ballistic, drone nearby, power until 21:00">

The card ships with the integration, nothing else to install: Dashboard → **Edit** → **Add card** → **By card**
→ search "notch" → **Тривога в нотчі (NotchAlert)**. The place is already picked; layout "By width", "Compact" or
"Wide"; toggles hide the power and the targets. Hatched hours on the strip have no schedule yet.

### Entities

| Entity | What |
|---|---|
| `binary_sensor.<place>_air_raid_alert` | Air-raid alert in the district (attributes `level`, `threats`, `since`, `reason`) |
| `sensor.<place>_alert_level` | `none` / `yellow` / `red` |
| `sensor.<place>_threat` | The most severe threat: `none`, `massive`, `ballistic`, `cruise`, `mig`, `kab`, `aircraft`, `drone`; all of them in `list` and as true/false attributes |
| `sensor.<place>_alert_started`, `sensor.<place>_last_all_clear` | When the alert began, when the last all-clear was |
| `binary_sensor.<place>_drone_nearby`, `sensor.<place>_drone_distance` | A drone within the radius of home and its distance, km |
| `sensor.<place>_power`, `binary_sensor.<place>_power_schedule` | Scheduled power: `on` / `off` / `maybe` / `unknown`; attributes `group`, `intervals` (outages ahead), `known_until` (how far the schedule is known) |
| `sensor.<place>_targets_over_the_oblast` | Targets tracked over the oblast (attributes: approaching, leaving, shot down) |

Without fresh data from the server, entities become `unavailable`, never "all clear".

### Events

`notchalert_alert_started` (`place`, `level`, `threats`, `since`, `reason`), `notchalert_alert_ended`
(`place`, `lasted_min`), `notchalert_threat` (`place`, `threat`, `level`), `notchalert_drone_near`
(`place`, `km`, `detail`). See the automation examples above.

### How fast

The integration keeps a request open and the server answers as soon as the state changes, so an alert shows up
within a second. A fallback poll runs every 30 s. When the server asks to wait (HTTP 429), the integration waits
exactly as long as asked.

## License

MIT
