

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2. Crear tabla de direcciones
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Casa', -- Casa, Oficina, etc.
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,
    exterior_number VARCHAR(20) NOT NULL,
    interior_number VARCHAR(20),
    neighborhood VARCHAR(100) NOT NULL, -- Colonia
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'México',
    references_text TEXT, -- Referencias adicionales
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);

-- 3. Agregar campos de envío a orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id INTEGER REFERENCES addresses(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_snapshot JSONB; 
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'pending'; 
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'; 
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255); 
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT; -- Notas del cliente

CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    response_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);

-- NOTA: Para Stripe necesitarás:
-- 1. Instalar: pnpm add stripe
-- 2. Agregar STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en .env
-- 3. Crear webhook en dashboard de Stripe apuntando a /api/payments/webhook

-- NOTA: Para Google Places API (autocompletado de direcciones):
-- 1. Obtener API Key en Google Cloud Console
-- 2. Habilitar Places API
-- 3. Agregar VITE_GOOGLE_PLACES_API_KEY en frontend/.env
