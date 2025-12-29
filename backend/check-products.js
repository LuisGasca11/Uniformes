const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'uniformes',
  user: 'postgres',
  password: 'Blackkey26$'
});

async function checkProducts() {
  try {
    const products = await pool.query('SELECT id, name FROM products LIMIT 5');
    
    for (const product of products.rows) {
      const images = await pool.query('SELECT id, image_url FROM product_images WHERE product_id = $1', [product.id]);
      console.log(`\nProducto: ${product.name} (ID: ${product.id})`);
      console.log('Imágenes:', images.rows);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkProducts();
