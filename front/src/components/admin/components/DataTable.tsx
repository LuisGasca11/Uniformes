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
        className="border border-gray-300 rounded px-2 py-1 text-sm"
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
    <div className="overflow-hidden rounded-xl border bg-surface shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Marca</th>
              <th className="p-4 font-semibold">Precio</th>
              <th className="p-4 font-semibold">Categoría</th>
              <th className="p-4 font-semibold text-center">Variantes</th>
              <th className="p-4 font-semibold text-center">Stock total</th>
              <th className="p-4 font-semibold">Códigos / Claves</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
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
                  className={`
                    border-b transition hover:bg-muted
                    ${i % 2 === 0 ? "bg-surface" : "bg-muted/20"}
                  `}
                >
                  {/* ID */}
                  <td className="p-4">{p.id}</td>

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
