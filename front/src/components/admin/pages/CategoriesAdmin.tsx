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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Vista previa de categorías */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Vista previa (como se ve en la tienda)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden grid grid-cols-2 h-32"
            >
              <div className="bg-gray-100">
                {category.image_url ? (
                  <img
                    src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de administración */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Orden</th>
              <th className="text-left p-4">Imagen</th>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Descripción</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-left p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{category.display_order}</td>
                <td className="p-4">
                  {category.image_url ? (
                    <img
                      src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium">{category.name}</td>
                <td className="p-4 text-sm text-gray-600">
                  {category.description || "-"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      category.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
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

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Imagen</label>
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
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-2">Orden</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label>Categoría activa</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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