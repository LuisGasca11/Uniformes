import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, Tag, ChevronLeft } from "lucide-react"; 

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";

  const [products, setProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    size: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    sort: "relevance",
  });

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = [
    { hex: "#FFD600", name: "Amarillo" },
    { hex: "#FF6B00", name: "Naranja" },
    { hex: "#000000", name: "Negro" },
    { hex: "#C00000", name: "Rojo" },
    { hex: "#001F54", name: "Azul Marino" },
    { hex: "#00A650", name: "Verde" },
  ];

  const load = async () => {
    const query = new URLSearchParams({
      q,
      size: filters.size,
      color: filters.color,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    });

    const qs = query.toString();
    const res = await fetch(`http://localhost:4000/api/search?${qs}`);
    const data = await res.json();

    setProducts(data.products ?? []);
  };

  useEffect(() => {
    load();
  }, [q, filters]);

  const hasActiveFilters = filters.size || filters.color || filters.minPrice || filters.maxPrice;

  const clearAllFilters = () => {
    setFilters({
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        <button
          onClick={() => navigate('/uniformes')}
          className="flex items-center gap-2 text-gray-700 hover:text-sky-600 transition duration-200 font-medium mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a Categorías
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Resultados de búsqueda
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <span className="font-semibold text-sky-600">"{q}"</span>
            <span className="text-gray-400">•</span>
            <span>{products.length} productos encontrados</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <SlidersHorizontal size={20} />
            <span className="font-semibold">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[filters.size, filters.color, filters.minPrice || filters.maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* SIDEBAR FILTERS */}
          <aside
            className={`
              lg:block 
              w-full lg:w-80 bg-white rounded-2xl shadow-xl p-6
              lg:sticky lg:top-6 lg:self-start
              space-y-6 transform transition-all duration-300

              ${showFilters ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"}
            `}
          >

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="text-sky-600" size={24} />
                Filtros
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  Limpiar todo
                </button>
              )}
            </div>

            {/* TALLAS */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-sky-500 rounded-full"></div>
                Tallas
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setFilters({ ...filters, size: filters.size === size ? "" : size })}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${
                        filters.size === size
                          ? "bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* COLORES */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                Colores
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        color: filters.color === color.hex ? "" : color.hex,
                      })
                    }
                    className={`
                      relative w-12 h-12 rounded-xl cursor-pointer 
                      transition-all duration-200 hover:scale-110
                      ${
                        filters.color === color.hex
                          ? "ring-4 ring-sky-500 ring-offset-2 scale-110"
                          : "ring-2 ring-gray-200 hover:ring-gray-300"
                      }
                    `}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {filters.color === color.hex && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* PRECIOS */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                Rango de precio
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ORDEN */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                Ordenar por
              </h3>
              <div className="relative">
                <select
                  className="w-full appearance-none px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none bg-white cursor-pointer font-medium"
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price_asc">Precio: Menor a mayor</option>
                  <option value="price_desc">Precio: Mayor a menor</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
          </aside>

          {/* RESULTADOS */}
          <main className="flex-1">
            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.size && (
                  <span className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">
                    Talla: {filters.size}
                    <button onClick={() => setFilters({ ...filters, size: "" })}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.color && (
                  <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                    Color seleccionado
                    <button onClick={() => setFilters({ ...filters, color: "" })}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    ${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, minPrice: "", maxPrice: "" })
                      }
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p: any, index) => (
                  <div
                    key={p.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer animate-fadeInUp hover:scale-105"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/producto/${p.id}`)}
                  >
                    <div className="relative overflow-hidden bg-gray-50 aspect-square">
                      <img
                        src={`http://localhost:4000/uploads/${p.image}`}
                        alt={p.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      />
                      {p.discount && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{p.discount}%
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">
                        {p.name}
                      </h3>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            ${p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${p.originalPrice}
                            </span>
                          )}
                        </div>

                        <Tag className="text-sky-500 group-hover:text-sky-600 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-6">
                  Intenta ajustar tus filtros o buscar algo diferente
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-linear-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}