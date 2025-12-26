import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";

interface Category {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
}

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        
        {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mb-10">
              {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
              ))}
            </div>
        ) : (
            <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-inner">
              <p className="text-xl font-medium text-gray-500">
                  No hay categorías disponibles en este momento.
              </p>
            </div>
        )}
        

        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/todos-los-productos")}
            className="
              px-10 py-3  bg-linear-to-r from-sky-400 to-indigo-700 text-white font-bold rounded-xl text-lg
              hover:bg-indigo-700 transition shadow-xl hover:shadow-2xl
              flex items-center gap-2 transform hover:scale-[1.02]
            "
          >
            Ver todos los artículos
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesGrid;