import pool from "./src/db";

async function createWishlistTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log('✅ Tabla wishlist creada exitosamente');
    
    // Crear índices para mejor rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
    `);
    console.log('✅ Índices creados');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createWishlistTable();
