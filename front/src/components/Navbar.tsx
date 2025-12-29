import { useCart } from "@/hooks/CartProvider";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/WishlistProvider";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  MapPin,
  ShoppingCart,
  ChevronDown,
  X,
  LayoutDashboard,
  Package,
  Plus,
  ClipboardList,
  Store,
  FolderTree,
  Heart,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Login from "../components/admin/pages/Login";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");


  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { user, isLogged, logout, role } = useAuth();
  const { totalQuantity, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    setCartBounce(true);
    const timer = setTimeout(() => setCartBounce(false), 500);
    return () => clearTimeout(timer);
  }, [totalQuantity]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await fetch(
        `http://localhost:4000/api/search/autocomplete?q=${searchQuery}`
      );
      const data = await res.json();
      setSuggestions(data.products || []);
      setShowSuggestions(true);
    }, 250);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const open = () => setShowLogin(true);
    window.addEventListener("open-login", open);
    return () => window.removeEventListener("open-login", open);
  }, []);

  useEffect(() => {
    const close = () => setShowLogin(false);
    window.addEventListener("login-success", close);
    return () => window.removeEventListener("login-success", close);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLogin(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showLogin &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setShowLogin(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLogin]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("http://localhost:4000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    }

    loadCategories();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
  };

  const adminLinks = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Productos", to: "/admin/products", icon: Package },
    { label: "Categorías", to: "/admin/categories", icon: FolderTree }, 
    { label: "Crear producto", to: "/admin/products/new", icon: Plus },
    { label: "Órdenes", to: "/admin/orders", icon: ClipboardList },
    { label: "Ver tienda", to: "/uniformes", icon: Store },
  ];

  return (
    <>
      <nav className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative shadow-lg">
        {/* Primera fila - Logo, búsqueda y acciones */}
        <div className="px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Menu Button - Solo móvil */}
            <button 
              className="lg:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-all duration-200 active:scale-95 shrink-0" 
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Logo */}
            <div
              className="shrink-0 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img src="/fyttwh.png" className="w-14 sm:w-16 md:w-20 hover:scale-105 transition-transform duration-300" alt="Fyttsa Logo" />
            </div>

            {/* Ubicación - Solo desktop */}
            <div className="hidden lg:flex items-center gap-1 text-xs cursor-pointer hover:text-sky-400 transition-colors shrink-0">
              <MapPin className="w-4 h-4" />
              <div>
                <div className="text-gray-400">Enviar a</div>
                <div className="font-bold">México</div>
              </div>
            </div>

            {/* Search Bar - Se expande */}
            <div className="flex-1 flex min-w-0 relative" ref={dropdownRef}>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  if (value === "all") {
                    navigate("/uniformes"); 
                  } else {
                    navigate(`/categoria/${value}`);
                  }
                }}
                className="hidden md:block bg-gray-200 text-gray-800 px-2 py-2 rounded-l text-sm border-r border-gray-300 focus:outline-none shrink-0"
              >
                <option value="all">Todos</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar en Fyttsa"
                className="flex-1 min-w-0 px-3 py-2 rounded-l md:rounded-none text-gray-900 bg-white outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />

              <button
                className="bg-[#009be9] hover:bg-[#0089d0] px-3 sm:px-4 rounded-r transition-colors shrink-0"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white text-gray-900 rounded-lg shadow-2xl z-50 mt-1 max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => {
                        navigate(`/buscar?q=${encodeURIComponent(item.name)}`);
                        setShowSuggestions(false);
                      }}
                    >
                      <img
                        src={item.image ? `http://localhost:4000/uploads/${item.image}` : "/products/default.jpg"}
                        className="w-12 h-12 object-cover rounded border"
                        alt={item.name}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.name}</div>
                        <div className="text-[#009be9] font-bold text-sm">${item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones - Desktop */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              {/* Account Menu */}
              <div ref={accountRef} className="relative">
                {isLogged ? (
                  <>
                    <div 
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="cursor-pointer hover:text-sky-400 transition-colors text-sm"
                    >
                      <div className="text-gray-400">Hola, {user?.name?.split(' ')[0]}</div>
                      <div className="font-bold flex items-center gap-1">
                        Cuenta <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {showAccountMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-2xl py-2 min-w-[180px] z-50">
                        <div onClick={() => { navigate("/perfil"); setShowAccountMenu(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                          <Package className="w-4 h-4" /> Mi perfil
                        </div>
                        <div onClick={() => { navigate("/mis-pedidos"); setShowAccountMenu(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" /> Mis pedidos
                        </div>
                        <div onClick={() => { navigate("/favoritos"); setShowAccountMenu(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
                          <Heart className="w-4 h-4" /> Favoritos
                        </div>
                        <div className="border-t my-1"></div>
                        <div onClick={() => { logout(); setShowAccountMenu(false); navigate("/"); }} className="px-4 py-2 text-red-500 hover:bg-red-50 cursor-pointer flex items-center gap-2">
                          <X className="w-4 h-4" /> Cerrar sesión
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div onClick={() => navigate("/login")} className="cursor-pointer hover:text-sky-400 transition-colors text-sm">
                    <div className="text-gray-400">Hola, Identifícate</div>
                    <div className="font-bold flex items-center gap-1">Cuenta <ChevronDown className="w-4 h-4" /></div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/favoritos" className="relative hover:text-red-400 transition-colors">
                <Heart className="w-7 h-7" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <div onClick={toggleCart} className={`cursor-pointer flex items-center gap-1 hover:text-sky-400 transition-colors ${cartBounce ? 'animate-bounce' : ''}`}>
                <div className="relative">
                  <ShoppingCart className="w-8 h-8" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm">Carrito</span>
              </div>
            </div>

            {/* Acciones - Móvil */}
            <div className="flex lg:hidden items-center gap-1 shrink-0">
              <Link to="/favoritos" className="relative p-1.5 hover:bg-gray-700 rounded-lg">
                <Heart className="w-6 h-6" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <div onClick={toggleCart} className="relative p-1.5 hover:bg-gray-700 rounded-lg cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Bar - Solo para admins */}
        {isLogged && role === "admin" && (
          <div className="bg-gray-800 border-t border-gray-700 px-2 py-2 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-gray-700 hover:bg-[#009be9] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
          <div 
            className="bg-white w-72 max-w-[85vw] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-linear-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div className="text-lg font-bold">Menú</div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {isLogged ? (
                <>
                  <div className="font-bold text-gray-800 pb-2 border-b">
                    Hola, {user?.name}
                  </div>
                  <button
                    onClick={() => { navigate("/perfil"); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Package className="w-5 h-5" /> Mi perfil
                  </button>
                  <button
                    onClick={() => { navigate("/mis-pedidos"); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <ClipboardList className="w-5 h-5" /> Mis pedidos
                  </button>
                  <button
                    onClick={() => { navigate("/favoritos"); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-5 h-5" /> Favoritos
                  </button>
                  <div className="border-t my-2"></div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                    className="w-full text-left px-3 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate("/login"); setMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-[#009be9] text-white rounded-lg hover:bg-[#0089d0] transition-colors font-medium"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => { navigate("/registro"); setMenuOpen(false); }}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Crear cuenta
                  </button>
                </>
              )}

              <div className="border-t my-3 pt-3">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Categorías</div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { navigate(`/categoria/${cat.id}`); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <Login />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;