import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/WishlistProvider";

interface ProductImage {
  id: number;
  image_url: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  images?: ProductImage[];
}

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/products?category=${categoryId}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          // Filtrar el producto actual y limitar a 4
          const filtered = data
            .filter((p: Product) => p.id !== currentProductId)
            .slice(0, 4);
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelated();
    }
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-8 bg-[#009be9] rounded-full"></span>
        También te puede interesar
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative"
          >
            {/* Botón de favoritos */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isInWishlist(product.id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
              />
            </button>

            <Link to={`/producto/${product.slug || product.id}`}>
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? `http://localhost:4000/uploads/${product.images[0].image_url}`
                      : "/products/default.jpg"
                  }
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#009be9] transition-colors">
                  {product.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-[#009be9]">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
