import { useEffect, useState } from "react";

interface ProductFormProps {
  product: any;
  setProduct: (p: any) => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

export default function ProductForm({
  product,
  setProduct,
  onSubmit,
  onDelete,
}: ProductFormProps) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Información del producto</h2>

      <div className="space-y-5">
        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Nombre del producto *
          </label>
          <input
            type="text"
            value={product.name || ""}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Ej: Camisa polo azul"
          />
        </div>

        {/* MARCA */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Marca</label>
          <input
            type="text"
            value={product.brand || ""}
            onChange={(e) => setProduct({ ...product, brand: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Ej: TRUPER"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Descripción</label>
          <textarea
            value={product.description || ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            rows={4}
            placeholder="Describe el producto..."
          />
        </div>

        {/* PRECIO Y CATEGORÍA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PRECIO */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Precio *</label>
            <input
              type="number"
              step="0.01"
              value={product.price || ""}
              onChange={(e) =>
                setProduct({ ...product, price: parseFloat(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="0.00"
            />
          </div>

          {/* CATEGORÍA */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Categoría</label>
            <select
              value={product.category_id || ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  category_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onSubmit}
          className="flex-1 bg-[#009be9] text-white py-2.5 rounded-xl hover:bg-[#0088cc] transition-all font-semibold shadow-lg"
        >
          Guardar cambios
        </button>

        {onDelete && (
          <button
            onClick={onDelete}
            className="px-6 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-all font-semibold shadow-lg"
          >
            Eliminar producto
          </button>
        )}
      </div>
    </div>
  );
}