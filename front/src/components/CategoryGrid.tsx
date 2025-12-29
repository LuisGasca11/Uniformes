import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
}

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-[#e3e6e6] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-sm shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e3e6e6] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 py-4">
        
        {/* Banner promocional estilo Amazon */}
        <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
          <div className="bg-linear-to-r from-gray-800 to-gray-700 p-6 sm:p-8">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Bienvenido a FYTTSA
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                Encuentra uniformes y productos de calidad para tu empresa
              </p>
              <Link 
                to="/todos-los-productos"
                className="inline-block bg-[#009be9] hover:bg-[#0089d0] text-white text-sm font-medium px-4 py-2 rounded-sm transition-colors"
              >
                Ver todos los productos
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Grid - Estilo Amazon */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.id}`}
                className="bg-white p-5 rounded-sm shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Título arriba */}
                <h2 className="text-lg sm:text-xl font-bold text-[#0f1111] mb-3 leading-tight">
                  {category.name}
                </h2>
                
                {/* Imagen */}
                <div className="relative h-44 sm:h-48 mb-3 overflow-hidden rounded-sm bg-gray-50 flex items-center justify-center">
                  {category.image_url ? (
                    <img
                      src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                      alt={category.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-5xl font-bold text-gray-800">${category.name.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-5xl font-bold text-gray-800">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Link "Ver más" */}
                <span className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
                  Ver más
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-sm shadow-sm text-center">
            <p className="text-gray-600">No hay categorías disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesGrid;