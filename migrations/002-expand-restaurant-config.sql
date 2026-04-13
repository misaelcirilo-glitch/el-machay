-- 002: Expandir config del restaurante para multi-tenant
-- Permite que cualquier restaurante configure su identidad, moneda, horarios y niveles VIP

-- Actualizar config del restaurante con campos completos
UPDATE config SET value = jsonb_set(
    value,
    '{}',
    '{
        "name": "El Machay",
        "subtitle": "Parrillas & Ceviche Peruano",
        "city": "Pomabamba",
        "department": "Ancash",
        "country": "PE",
        "country_name": "Perú",
        "phone": "",
        "currency": "PEN",
        "currency_symbol": "S/",
        "locale": "es",
        "timezone": "America/Lima",
        "points_per_unit": 1,
        "welcome_bonus": 50,
        "referral_bonus": 100,
        "logo_url": null,
        "primary_color": "#f59e0b",
        "secondary_color": "#dc2626"
    }'::jsonb
) WHERE key = 'restaurant';

-- Expandir horarios con time_slots para reservas
UPDATE config SET value = '{
    "schedule": {
        "lunes": "12:00-22:00",
        "martes": "12:00-22:00",
        "miercoles": "12:00-22:00",
        "jueves": "12:00-22:00",
        "viernes": "12:00-23:00",
        "sabado": "12:00-23:00",
        "domingo": "12:00-21:00"
    },
    "time_slots": [
        {"key": "morning", "start": "09:00", "end": "14:00", "interval": 30},
        {"key": "evening", "start": "18:00", "end": "21:00", "interval": 30}
    ],
    "max_party_size": 16,
    "table_locations": ["interior", "terraza", "privado"]
}'::jsonb WHERE key = 'hours';

-- Expandir vip_levels con iconos y colores
UPDATE config SET value = '{
    "levels": [
        {"key": "bronce", "min_points": 0, "icon": "🥉", "color": "from-amber-700 to-amber-900", "benefit": "Acumula puntos"},
        {"key": "plata", "min_points": 500, "icon": "🥈", "color": "from-slate-400 to-slate-600", "benefit": "Postre gratis en cumpleaños"},
        {"key": "oro", "min_points": 1500, "icon": "🥇", "color": "from-yellow-400 to-amber-500", "benefit": "Bebida cortesía + mesa preferente"},
        {"key": "inca", "min_points": 5000, "icon": "👑", "color": "from-red-500 to-amber-500", "benefit": "Descuento 15% permanente + eventos exclusivos"}
    ]
}'::jsonb WHERE key = 'vip_levels';
