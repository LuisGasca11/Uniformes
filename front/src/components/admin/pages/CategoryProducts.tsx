import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importamos useNavigate
import { ChevronLeft } from "lucide-react"; // Importamos el icono de Volver
import HeroSection from "@/components/HeroSection";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryMenu from "@/components/CategoryMenu";
import ProductsGrid from "@/components/ProductsGrid";
import type { Product } from "@/types/product";

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

const CategoryProducts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Inicializamos navigate

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Category Data
        const catRes = await fetch(`http://localhost:4000/api/categories/${id}`);
        if (!catRes.ok) throw new Error("Categoría no encontrada");
        const catData = await catRes.json();
        setCategory(catData);

        // Fetch Products Data
        const prodRes = await fetch(
          `http://localhost:4000/api/categories/${id}/products`
        );
        const prodData = await prodRes.json();
        setProducts(prodData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        // Opcional: Redirigir si la categoría no existe
        // navigate('/categorias'); 
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <Breadcrumb />
      <CategoryMenu />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* BOTÓN DE VOLVER A CATEGORÍAS */}
        <button
          onClick={() => navigate(-1)} // Navega a la vista anterior (CategoríasGrid)
          className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition duration-200 font-medium mb-6 sm:mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a Categorías
        </button>

        {category && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-start gap-6 mb-4">
              {category.image_url && (
                <img
                  src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                  alt={category.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-md shrink-0 border-2 border-indigo-100"
                />
              )}
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-gray-600 mt-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            <div className="text-sm font-semibold text-gray-500 pt-4 border-t border-gray-100 mt-4">
              {products.length} {products.length === 1 ? "producto" : "productos"} encontrados en esta categoría
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-12 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-inner">
            <p className="text-xl mb-2 text-gray-700">
              No hay productos disponibles en esta categoría
            </p>
            <p className="text-sm">Pronto agregaremos más productos.</p>
          </div>
        ) : (
          <ProductsGrid products={products} loading={false} />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;