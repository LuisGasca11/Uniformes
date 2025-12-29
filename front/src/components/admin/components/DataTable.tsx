import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useState } from "react";

function VariantCodeSelect({ variants }: { variants: any[] }) {
  const [selected, setSelected] = useState<any | null>(
    variants.length ? variants[0] : null
  );

  if (!variants.length) {
    return <span className="text-gray-400">Sin variantes</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={selected?.id}
        onChange={(e) =>
          setSelected(variants.find((v) => v.id === Number(e.target.value)))
        }
      >
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.size} · {v.gender === "male" ? "H" : v.gender === "female" ? "M" : "U"}
          </option>
        ))}
      </select>

      <div className="text-xs font-mono text-gray-700">
        <div>Código: {selected?.code ?? "—"}</div>
        <div>Clave: {selected?.key_code ?? "—"}</div>
      </div>
    </div>
  );
}

export default function DataTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">ID</th>
              <th className="p-4 font-semibold text-gray-700">Nombre</th>
              <th className="p-4 font-semibold text-gray-700">Marca</th>
              <th className="p-4 font-semibold text-gray-700">Precio</th>
              <th className="p-4 font-semibold text-gray-700">Categoría</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Variantes</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Stock total</th>
              <th className="p-4 font-semibold text-gray-700">Códigos / Claves</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p, i) => {
              const variants = p.variants ?? [];

              const totalStock = variants.reduce(
                (acc: number, v: any) => acc + (v.stock ?? 0),
                0
              );

              return (
                <tr
                  key={p.id}
                  className="border-b transition-colors hover:bg-blue-50/30 bg-white"
                >
                  {/* ID */}
                  <td className="p-4 font-bold text-gray-500">{p.id}</td>

                  {/* Nombre */}
                  <td className="p-4 font-medium">{p.name}</td>

                  {/* Marca */}
                  <td className="p-4">
                    {p.brand ? (
                      <span className="font-semibold text-orange-600">
                        {p.brand}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Precio */}
                  <td className="p-4 font-semibold text-blue-600">
                    ${p.price}
                  </td>

                  {/* Categoría */}
                  <td className="p-4">
                    {p.category_name ?? (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Variantes */}
                  <td className="p-4 text-center font-semibold">
                    {variants.length}
                  </td>

                  {/* Stock total */}
                  <td className="p-4 text-center">
                    <span
                      className={`font-semibold ${
                        totalStock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {totalStock}
                    </span>
                  </td>

                  {/* Códigos / Claves */}
                  <td className="p-4">
                    <VariantCodeSelect variants={p.variants ?? []} />
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    <div className="flex justify-center">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="
                          flex items-center gap-2
                          px-3 py-1.5 rounded-lg
                          bg-blue-600 text-white text-sm
                          hover:bg-blue-700 transition shadow
                          active:scale-95
                        "
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-6 text-center text-gray-500 italic"
                >
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
