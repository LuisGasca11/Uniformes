import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryMenu from "@/components/CategoryMenu";
import ProductsGrid from "@/components/ProductsGrid";
import Pagination from "@/components/Pagination";
import type { Product } from "@/types/product";

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

interface ColorOption {
  color_hex: string;
  color_name: string;
}

const ITEMS_PER_PAGE = 12;

const CategoryProducts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`http://localhost:4000/api/categories/${id}`);
        if (!catRes.ok) throw new Error("Categoría no encontrada");
        const catData = await catRes.json();
        setCategory(catData);

        const prodRes = await fetch(
          `http://localhost:4000/api/categories/${id}/products`
        );
        const prodData = await prodRes.json();
        setProducts(prodData);
        setFilteredProducts(prodData);

        // Calcular precio máximo
        if (prodData.length > 0) {
          const maxPrice = Math.max(...prodData.map((p: Product) => parseFloat(String(p.price))));
          setPriceRange([0, Math.ceil(maxPrice / 100) * 100]);
        }

        // Extraer colores disponibles de las variantes
        const colors = new Map<string, ColorOption>();
        prodData.forEach((p: Product) => {
          p.variants?.forEach((v) => {
            if (v.color_hex && !colors.has(v.color_hex)) {
              colors.set(v.color_hex, { color_hex: v.color_hex, color_name: v.color_name });
            }
          });
        });
        setAvailableColors(Array.from(colors.values()));
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
      // Reset filtros al cambiar de categoría
      setSelectedColors([]);
      setSortBy("default");
    }
  }, [id]);

  // Aplicar filtros
  useEffect(() => {
    let result = [...products];

    // Filtrar por precio
    result = result.filter(p => {
      const price = parseFloat(String(p.price));
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filtrar por colores
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.variants?.some(v => selectedColors.includes(v.color_hex))
      );
    }

    // Ordenar
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, priceRange, sortBy, selectedColors]);

  const clearFilters = () => {
    const maxPrice = products.length > 0 
      ? Math.ceil(Math.max(...products.map(p => parseFloat(String(p.price)))) / 100) * 100
      : 10000;
    setPriceRange([0, maxPrice]);
    setSortBy("default");
    setSelectedColors([]);
    setCurrentPage(1);
  };

  const toggleColor = (colorHex: string) => {
    setSelectedColors(prev => 
      prev.includes(colorHex) 
        ? prev.filter(c => c !== colorHex)
        : [...prev, colorHex]
    );
  };

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const maxPriceValue = products.length > 0 
    ? Math.ceil(Math.max(...products.map(p => parseFloat(String(p.price)))) / 100) * 100
    : 10000;

  const activeFiltersCount = [
    priceRange[0] > 0 || priceRange[1] < maxPriceValue,
    sortBy !== "default",
    selectedColors.length > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <Breadcrumb />
      <CategoryMenu />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-[#009be9] transition duration-200 font-medium mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>

        {category && (
          <div className="mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              {category.image_url && (
                <img
                  src={`http://localhost:4000/uploads/categories/${category.image_url}`}
                  alt={category.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md shrink-0"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm sm:text-lg text-gray-600 mt-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header con controles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-gray-500">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-[#009be9] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-[#009be9]"
              >
                <option value="default">Ordenar por</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <aside className={`
            ${showFilters ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} 
            lg:relative lg:block lg:bg-transparent lg:z-auto
          `}>
            <div className={`
              ${showFilters ? 'absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto' : ''} 
              lg:relative lg:w-64 lg:p-0
            `}>
              {showFilters && (
                <div className="flex justify-between items-center mb-6 lg:hidden">
                  <h2 className="text-lg font-bold">Filtros</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Filtros</h3>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-[#009be9] hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Filtro por precio */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Precio</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Mínimo</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009be9]"
                          min={0}
                          max={priceRange[1]}
                        />
                      </div>
                      <span className="text-gray-400 mt-5">-</span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Máximo</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009be9]"
                          min={priceRange[0]}
                          max={maxPriceValue}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxPriceValue}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-[#009be9]"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0</span>
                      <span>${maxPriceValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Filtro por colores */}
                {availableColors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color.color_hex}
                          onClick={() => toggleColor(color.color_hex)}
                          title={color.color_name}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all
                            ${selectedColors.includes(color.color_hex) 
                              ? 'border-[#009be9] ring-2 ring-[#009be9]/30 scale-110' 
                              : 'border-gray-300 hover:border-gray-400'}
                          `}
                          style={{ backgroundColor: color.color_hex }}
                        />
                      ))}
                    </div>
                    {selectedColors.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedColors.length} color{selectedColors.length > 1 ? 'es' : ''} seleccionado{selectedColors.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {showFilters && (
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden w-full mt-6 bg-[#009be9] text-white py-3 rounded-xl font-bold"
                >
                  Ver {filteredProducts.length} resultados
                </button>
              )}
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center text-gray-500 py-12">
                Cargando productos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-12 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <p className="text-xl mb-2 text-gray-700">
                  No hay productos que coincidan con los filtros
                </p>
                <button 
                  onClick={clearFilters}
                  className="text-[#009be9] hover:underline mt-2"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <ProductsGrid products={paginatedProducts} loading={false} />
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;