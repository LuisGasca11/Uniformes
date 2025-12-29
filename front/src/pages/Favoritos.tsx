import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/hooks/WishlistProvider";
import { useAuth } from "@/hooks/useAuth";

const Favoritos = () => {
  const { items, removeFromWishlist, loading } = useWishlist();
  const { isLogged } = useAuth();

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Inicia sesión para ver tus favoritos
          </h2>
          <p className="text-gray-600 mb-6">
            Guarda tus productos favoritos para comprarlos después
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-[#009be9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0089d0] transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-[#009be9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Mis Favoritos
            </h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Tu lista de favoritos está vacía
            </h2>
            <p className="text-gray-500 mb-6">
              Explora nuestros productos y guarda los que más te gusten
            </p>
            <Link
              to="/todos-los-productos"
              className="inline-flex items-center gap-2 bg-[#009be9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0089d0] transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                <Link to={`/producto/${item.product.slug || item.product_id}`}>
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={
                        item.product.image
                          ? `http://localhost:4000/uploads/${item.product.image}`
                          : "/products/default.jpg"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Badge de favorito */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/producto/${item.product.slug || item.product_id}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-[#009be9] transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xl font-bold text-[#009be9]">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/producto/${item.product.slug || item.product_id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#009be9] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#0089d0] transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ver producto
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar de favoritos"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
