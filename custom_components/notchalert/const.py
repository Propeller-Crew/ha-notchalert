"""Сталі інтеграції «Тривога в нотчі»."""

DOMAIN = "notchalert"
API_URL = "https://notchalert.propellercrew.com/v1/device"

CONF_PLACE = "place"

# Раз на 30 с і без налаштування на довше: довший інтервал лише відтягує тривогу. Це запасне
# опитування: поки працює long-poll (сервер тримає запит до WAIT с, доки стан не зміниться), тривога приходить
# за секунду, а опитування мовчить.
SCAN_INTERVAL = 30
WAIT = 55                  # с: довше сервер запит не тримає
REQUEST_TIMEOUT = 15
# Retry-After без числа чи зовсім без нього — чекаємо стільки.
DEFAULT_RETRY_AFTER = 120

# Події для автоматизацій.
EVENT_ALERT_STARTED = f"{DOMAIN}_alert_started"
EVENT_ALERT_ENDED = f"{DOMAIN}_alert_ended"
EVENT_THREAT = f"{DOMAIN}_threat"
EVENT_DRONE_NEAR = f"{DOMAIN}_drone_near"

THREATS = ("massive", "ballistic", "cruise", "mig", "kab", "aircraft", "drone")
LEVELS = ("none", "yellow", "red")
POWER_STATES = ("on", "off", "maybe", "unknown")

