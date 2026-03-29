-- 001: El Machay - Schema Inicial
-- Restaurant peruano en Pomabamba, Ancash

-- Usuarios (clientes VIP + admin)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'waiter')),
    vip_level TEXT NOT NULL DEFAULT 'bronce' CHECK (vip_level IN ('bronce', 'plata', 'oro', 'inca')),
    total_points INT NOT NULL DEFAULT 0,
    available_points INT NOT NULL DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías del menú
CREATE TABLE menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Platos del menú
CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_spicy BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0
);

-- Mesas del restaurante
CREATE TABLE tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    location TEXT DEFAULT 'interior' CHECK (location IN ('interior', 'terraza', 'privado')),
    is_active BOOLEAN DEFAULT true
);

-- Reservas
CREATE TABLE reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INT NOT NULL DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    pre_order JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transacciones de puntos
CREATE TABLE point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'referral', 'expire')),
    points INT NOT NULL,
    description TEXT,
    reference_amount NUMERIC(10,2),
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promociones
CREATE TABLE promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_item', 'points_multiplier')),
    discount_value NUMERIC(10,2),
    min_points INT DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premios canjeables
CREATE TABLE rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INT NOT NULL,
    category TEXT DEFAULT 'discount' CHECK (category IN ('discount', 'free_item', 'experience', 'merchandise')),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0
);

-- Canjes realizados
CREATE TABLE redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    points_spent INT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback / reseñas
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Config del restaurante
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- Datos iniciales
INSERT INTO config (key, value) VALUES
    ('restaurant', '{"name": "El Machay", "city": "Pomabamba", "department": "Ancash", "country": "Perú", "phone": "", "currency": "PEN", "points_per_sol": 1, "timezone": "America/Lima"}'),
    ('vip_levels', '{"bronce": {"min_points": 0, "benefit": "Acumula puntos"}, "plata": {"min_points": 500, "benefit": "Postre gratis en cumpleaños"}, "oro": {"min_points": 1500, "benefit": "Bebida cortesía + mesa preferente"}, "inca": {"min_points": 5000, "benefit": "Descuento 15% permanente + eventos exclusivos"}}'),
    ('hours', '{"lunes": "12:00-22:00", "martes": "12:00-22:00", "miercoles": "12:00-22:00", "jueves": "12:00-22:00", "viernes": "12:00-23:00", "sabado": "12:00-23:00", "domingo": "12:00-21:00"}');

-- Categorías iniciales del menú
INSERT INTO menu_categories (name, description, sort_order) VALUES
    ('Ceviches', 'Nuestros ceviches frescos con pescado del día', 1),
    ('Parrillas', 'Cortes selectos a la parrilla', 2),
    ('Entradas', 'Para compartir', 3),
    ('Sopas', 'Caldos y sopas tradicionales', 4),
    ('Bebidas', 'Refrescos, jugos y cócteles', 5),
    ('Postres', 'Dulces tradicionales peruanos', 6);

-- Mesas iniciales
INSERT INTO tables (number, capacity, location) VALUES
    (1, 2, 'interior'), (2, 2, 'interior'),
    (3, 4, 'interior'), (4, 4, 'interior'),
    (5, 4, 'interior'), (6, 6, 'interior'),
    (7, 4, 'terraza'), (8, 4, 'terraza'),
    (9, 6, 'terraza'), (10, 8, 'privado');

-- Premios iniciales
INSERT INTO rewards (name, description, points_cost, category, sort_order) VALUES
    ('Chicha Morada gratis', 'Una jarra de chicha morada cortesía', 100, 'free_item', 1),
    ('Postre del día', 'Postre gratis con tu comida', 200, 'free_item', 2),
    ('10% de descuento', 'En tu próxima visita', 300, 'discount', 3),
    ('Ceviche gratis', 'Un ceviche clásico de cortesía', 500, 'free_item', 4),
    ('Parrilla para 2', 'Parrilla mixta gratis para dos personas', 1000, 'free_item', 5),
    ('Experiencia Chef', 'Cena privada con el chef + maridaje', 3000, 'experience', 6);

-- Índices
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
