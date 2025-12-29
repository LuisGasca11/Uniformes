-- Arreglar order_items que no tienen product_id
-- Ejecuta esto en tu base de datos PostgreSQL

UPDATE order_items oi
SET product_id = pv.product_id
FROM product_variants pv
WHERE oi.variant_id = pv.id
AND oi.product_id IS NULL;

-- Verificar que se arreglaron
SELECT COUNT(*) as items_sin_product FROM order_items WHERE product_id IS NULL;
