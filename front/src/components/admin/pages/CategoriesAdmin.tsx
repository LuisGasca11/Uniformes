import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
}

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("display_order", formData.display_order.toString());
    formDataToSend.append("is_active", formData.is_active.toString());
    
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const url = editingCategory
        ? `http://localhost:4000/api/categories/${editingCategory.id}`
        : "http://localhost:4000/api/categories";
      
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) throw new Error("Error al guardar categoría");

      toast.success(
        editingCategory ? "Categoría actualizada" : "Categoría creada"
      );
      
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar la categoría");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    if (category.image_url) {
      setPreviewUrl(`http://localhost:4000/uploads/categories/${category.image_url}`);
    }
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Categoría eliminada");
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la categoría");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", display_order: 0, is_active: true });
    setImageFile(null);
    setPreviewUrl("");
    setEditingCategory(null);
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Gestión de Categorías</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#009be9] text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#0088cc] transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Vista previa de categorías */}
      <div className="mb-10 bg-white/80 p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Vista previa </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex h-36 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-center w-2/5 bg-gray-100">
                {category.image_url ? (
                  <img
                    src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                    alt={category.name}
                    className="w-24 h-24 object-contain rounded-lg shadow"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center text-gray-300 bg-white rounded-lg border">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                {category.description ? (
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Explora esta categoría</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de administración */}
      <div className="bg-white/90 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Orden</th>
              <th className="text-left p-4 font-semibold text-gray-700">Imagen</th>
              <th className="text-left p-4 font-semibold text-gray-700">Nombre</th>
              <th className="text-left p-4 font-semibold text-gray-700">Descripción</th>
              <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b hover:bg-blue-50/30 transition-colors">
                <td className="p-4 text-center font-bold text-gray-600">{category.display_order}</td>
                <td className="p-4">
                  {category.image_url ? (
                    <img
                      src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                      alt={category.name}
                      className="w-14 h-14 object-contain rounded-lg border shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <ImageIcon className="w-7 h-7 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-semibold text-gray-900">{category.name}</td>
                <td className="p-4 text-sm text-gray-500">
                  {category.description || <span className="italic text-gray-400">-</span>}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                      category.is_active
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {category.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 shadow transition-all duration-150"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 shadow transition-all duration-150"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-3 w-32 h-32 object-cover rounded-lg border shadow"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Orden</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label className="text-gray-700">Categoría activa</label>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#009be9] text-white py-2 rounded-xl font-bold shadow-lg hover:bg-[#0088cc] transition-all duration-200"
                >
                  {editingCategory ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-bold hover:bg-gray-300 shadow"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAdmin;