import { Link } from "react-router-dom";
import { Pencil, Eye, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";

interface AdminProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
}

export default function AdminProductCard({ product, onDelete }: AdminProductCardProps) {
  const img =
    product.images?.[0]?.image_url
      ? `http://localhost:4000/uploads/${product.images[0].image_url}`
      : "/products/default.jpg";

  const variants = product.variants || [];

  // Cálculo rápido de stock total
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div
      className="
        bg-white border border-gray-200 rounded-xl shadow-sm 
        hover:shadow-md transition p-4 flex flex-col w-[280px]
      "
    >
      {/* IMAGEN */}
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img src={img} className="h-full object-contain" alt={product.name} />
      </div>

      {/* MARCA, CÓDIGO Y CLAVE */}
      <div className="mt-3 space-y-2">
        {product.brand && (
          <div className="inline-block px-3 py-1 bg-linear-to-r from-orange-100 to-orange-200 text-orange-800 text-xs font-bold rounded-full border border-orange-300">
            {product.brand}
          </div>
        )}
        
        {(product.code || product.key_code) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {product.code && (
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <span className="font-bold text-blue-700">Cód:</span>
                <span className="text-gray-900 font-mono">{product.code}</span>
              </div>
            )}
            {product.key_code && (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                <span className="font-bold text-green-700">Clave:</span>
                <span className="text-gray-900 font-mono">{product.key_code}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOMBRE */}
      <h3 className="mt-2 text-gray-900 font-semibold text-[15px] line-clamp-2">
        {product.name}
      </h3>

      {/* PRECIO */}
      <p className="text-lg font-bold text-blue-600 mt-1">
        ${product.price}
      </p>

      {/* STOCK TOTAL */}
      <span
        className={`
          text-xs font-medium px-2 py-1 rounded-full mt-2 w-fit
          ${totalStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}
        `}
      >
        {totalStock > 0 ? `Stock: ${totalStock}` : "Sin stock"}
      </span>

      {/* VARIANTES RESUMIDAS */}
      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p className="font-semibold">Variantes:</p>

        <div className="flex flex-wrap gap-2">
          {variants.slice(0, 6).map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
            >
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: v.color_hex }}
              />
              <span>{v.size}</span>
              <span className="text-gray-500">({v.stock})</span>
            </div>
          ))}

          {variants.length > 6 && (
            <span className="text-gray-400 ml-1">+{variants.length - 6} más</span>
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-2 mt-4">
        {/* EDITAR */}
        <Link
          to={`/admin/products/edit/${product.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition"
        >
          <Pencil size={16} />
          Editar
        </Link>

        {/* VER PÚBLICO */}
        <Link
          to={`/producto/${product.id}`}
          target="_blank"
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg p-2 transition"
        >
          <Eye size={18} />
        </Link>

        {/* ELIMINAR */}
        <button
          onClick={() => onDelete && onDelete(product.id)}
          className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}