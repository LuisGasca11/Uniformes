-- Agregar columna last_login si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
