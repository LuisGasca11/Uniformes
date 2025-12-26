import { useState } from "react";
import Swal from "sweetalert2";
import { Trash2, Pencil, Check, X as Close, Plus } from "lucide-react";

interface Variant {
  id: number;
  size: string;
  color_name: string;
  color_hex: string;
  gender: "male" | "female" | "unisex";
  stock: number;
  code?: string;
  key_code?: string;
}

interface VariantManagerProps {
  product: any;
  setProduct: (product: any) => void;
  productId: number;
}

export default function VariantManager({ product, setProduct, productId }: VariantManagerProps) {
  const [form, setForm] = useState({
    size: "",
    color_name: "",
    color_hex: "#000000",
    gender: "unisex" as "male" | "female" | "unisex",
    stock: 0,
    code: "",
    key_code: "",
  });


  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Variant | null>(null);

  const variants = product.variants ?? [];

  const updateForm = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateEditForm = (field: string, value: any) =>
    setEditForm((prev: any) => ({ ...prev, [field]: value }));

  /* ADD */
  const addVariant = async () => {
    if (!form.size || !form.color_name) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "La talla y el color son obligatorios",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const res = await fetch("http://localhost:4000/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, ...form }),
    });

    const created = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Error al crear variante",
        text: created.error || "No se pudo crear la variante",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      toast: true,
      icon: "success",
      title: "Variante creada",
      position: "top-end",
      timer: 1500,
      showConfirmButton: false,
    });

    setProduct({
      ...product,
      variants: [...variants, created],
    });

    setForm({
      size: "",
      color_name: "",
      color_hex: "#000000",
      gender: "unisex",
      stock: 0,
      code: "",
      key_code: "",
    });
  };

  /* DELETE */
  const deleteVariant = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar variante?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`http://localhost:4000/api/variants/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar variante",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      toast: true,
      icon: "success",
      title: "Variante eliminada",
      position: "top-end",
      timer: 1500,
      showConfirmButton: false,
    });

    setProduct({
      ...product,
      variants: variants.filter((v: Variant) => v.id !== id),
    });
  };

  /* EDIT */
  const saveEdit = async () => {
    if (!editForm) return;

    const res = await fetch(
      `http://localhost:4000/api/variants/${editForm.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      }
    );

    const updated = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar variante",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      toast: true,
      icon: "success",
      title: "Variante actualizada",
      position: "top-end",
      timer: 1500,
      showConfirmButton: false,
    });

    setProduct({
      ...product,
      variants: variants.map((v: Variant) => (v.id === updated.id ? updated : v)),
    });

    setEditingId(null);
    setEditForm(null);
  };

  const genderLabels = {
    male: "Hombre",
    female: "Mujer",
    unisex: "Unisex",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Variantes de: {product.name}
        </h2>
        
        <div className="flex flex-wrap gap-3 text-sm">
          {product.brand && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-700">Marca:</span>
              <span className="text-orange-600 font-bold">{product.brand}</span>
            </div>
          )}
          {product.code && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-700">Código:</span>
              <span className="text-gray-900 font-mono">{product.code}</span>
            </div>
          )}
          {product.key_code && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-700">Clave:</span>
              <span className="text-gray-900 font-mono">{product.key_code}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
            <span className="font-semibold text-gray-700">Precio:</span>
            <span className="text-blue-600 font-bold">${product.price}</span>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE NUEVA VARIANTE */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3 text-gray-900">Agregar nueva variante</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Talla *
            </label>
            <input
              type="text"
              placeholder="S, M, L, XL..."
              value={form.size}
              onChange={(e) => updateForm("size", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color *
            </label>
            <input
              type="text"
              placeholder="Nombre del color"
              value={form.color_name}
              onChange={(e) => updateForm("color_name", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hex
            </label>
            <input
              type="color"
              value={form.color_hex}
              onChange={(e) => updateForm("color_hex", e.target.value)}
              className="w-full h-[42px] border border-gray-300 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={form.gender}
              onChange={(e) => updateForm("gender", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unisex">Unisex</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={(e) => updateForm("stock", Number(e.target.value))}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Código
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => updateForm("code", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Clave
          </label>
          <input
            type="text"
            value={form.key_code}
            onChange={(e) => updateForm("key_code", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

          <div className="flex items-end">
            <button
              onClick={addVariant}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-medium flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE VARIANTES */}
      {variants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay variantes agregadas</p>
          <p className="text-sm text-gray-400 mt-1">
            Agrega la primera variante usando el formulario arriba
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700">Talla</th>
                <th className="p-3 text-left font-semibold text-gray-700">Color</th>
                <th className="p-3 text-center font-semibold text-gray-700">Vista previa</th>
                <th className="p-3 text-left font-semibold text-gray-700">Género</th>
                <th className="p-3 text-left font-semibold text-gray-700">Stock</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Clave</th>
                <th className="p-3 text-center font-semibold text-gray-700 w-32">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {variants.map((v: Variant) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  {/* Talla */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <input
                        value={editForm?.size}
                        onChange={(e) => updateEditForm("size", e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-medium">{v.size}</span>
                    )}
                  </td>

                  {/* Color */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <input
                        value={editForm?.color_name}
                        onChange={(e) => updateEditForm("color_name", e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="capitalize">{v.color_name}</span>
                    )}
                  </td>

                  {/* Vista previa del color */}
                  <td className="p-3">
                    <div className="flex justify-center">
                      {editingId === v.id ? (
                        <input
                          type="color"
                          value={editForm?.color_hex}
                          onChange={(e) => updateEditForm("color_hex", e.target.value)}
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: v.color_hex }}
                          />
                          <span className="text-xs text-gray-500 font-mono">
                            {v.color_hex}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Género */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <select
                        value={editForm?.gender}
                        onChange={(e) => updateEditForm("gender", e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="unisex">Unisex</option>
                        <option value="male">Hombre</option>
                        <option value="female">Mujer</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {genderLabels[v.gender]}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editForm?.stock}
                        onChange={(e) => updateEditForm("stock", Number(e.target.value))}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          v.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {v.stock > 0 ? `${v.stock} unidades` : "Sin stock"}
                      </span>
                    )}
                  </td>

                  {/* Código */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <input
                        value={editForm?.code || ""}
                        onChange={(e) => updateEditForm("code", e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                    ) : (
                      <span className="font-mono text-sm">{v.code || "-"}</span>
                    )}
                  </td>

                  {/* Clave */}
                  <td className="p-3">
                    {editingId === v.id ? (
                      <input
                        value={editForm?.key_code || ""}
                        onChange={(e) => updateEditForm("key_code", e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                    ) : (
                      <span className="font-mono text-sm">{v.key_code || "-"}</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      {editingId === v.id ? (
                        <>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                            onClick={saveEdit}
                            title="Guardar cambios"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition"
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(null);
                            }}
                            title="Cancelar"
                          >
                            <Close className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition"
                            onClick={() => {
                              setEditingId(v.id);
                              setEditForm(v);
                            }}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                            onClick={() => deleteVariant(v.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen de stock */}
      {variants.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-900 font-medium">
              Stock total:{" "}
              <span className="font-bold">
                {variants.reduce((acc: number, v: Variant) => acc + v.stock, 0)} unidades
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}