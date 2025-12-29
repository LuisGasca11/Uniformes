const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'uniformes',
  user: 'postgres',
  password: 'Blackkey26$'
});

const updates = [
  { productId: 6, imgName: 'products/botatruper.png' },    // Botas TRUPER
  { productId: 1, imgName: 'products/chamarrabg.png' },    // Chamarra
  { productId: 2, imgName: 'products/guantes.png' },       // Guantes (si existe)
  { productId: 3, imgName: 'products/faja.png' },          // Faja
  { productId: 5, imgName: 'products/botarbg.png' }        // Botas PRETUL
];

async function updateProductImages() {
  try {
    for (const u of updates) {
      // Obtener el id de la imagen del producto
      const result = await pool.query(
        'SELECT id FROM product_images WHERE product_id = $1 LIMIT 1',
        [u.productId]
      );
      
      if (result.rows.length > 0) {
        const imageId = result.rows[0].id;
        await pool.query(
          'UPDATE product_images SET image_url = $1 WHERE id = $2',
          [u.imgName, imageId]
        );
        console.log(`✅ Actualizado producto ${u.productId} con imagen ${u.imgName}`);
      }
    }
    console.log('\n✅ Todas las imágenes de productos actualizadas');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateProductImages();
