const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'uniformes',
  user: 'postgres',
  password: 'Blackkey26$'
});

const updates = [
  { id: 1, img: 'logistica.png' },
  { id: 2, img: 'almacen.jpg' },
  { id: 4, img: 'limpieza.png' },
  { id: 5, img: 'otros.png' },
  { id: 6, img: 'otros.jpg' },
  { id: 7, img: 'comex.png' },
  { id: 8, img: 'comex.jpg' }
];

async function updateImages() {
  try {
    for (const u of updates) {
      await pool.query('UPDATE categories SET image_url = $1 WHERE id = $2', [u.img, u.id]);
      console.log(`Actualizado categoria ${u.id} con imagen ${u.img}`);
    }
    console.log('✅ Todas las imágenes actualizadas');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateImages();
