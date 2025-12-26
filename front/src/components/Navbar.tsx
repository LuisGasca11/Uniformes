import { useCart } from "@/hooks/CartProvider";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            
            {/* Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 active:scale-95" 
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="text-2xl md:text-3xl font-bold group-hover:scale-110 transition-transform duration-300">
                <img src="/fyttwh.png" className="w-16 sm:w-20 hover:scale-105 transition-transform duration-500" alt="Fyttsa Logo" />
              </div>

              <div className="hidden sm:block text-xs leading-tight hover:text-sky-400 transition-colors duration-200">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Enviar a</span>
                </div>
                <div className="font-bold">México</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 flex min-w-[200px] lg:max-w-none relative" ref={dropdownRef}>
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
                className="
                  hidden sm:block
                  bg-gray-100 text-gray-900
                  px-3 py-2 rounded-l
                  border-r border-gray-300
                  focus:outline-none
                  focus:ring-2 focus:ring-sky-400
                  transition-all
                "
              >
                <option value="all">Todos</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar en Fyttsa"
                className="flex-1 px-3 py-2 rounded-l sm:rounded-none text-white bg-gray-700 outline-none focus:bg-gray-600 transition-colors duration-200 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />

              <button
                className="bg-linear-to-r from-sky-400 to-sky-500 px-6 rounded-r hover:from-sky-500 hover:to-sky-600 transition-all duration-200 active:scale-95 shadow-md"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white text-black rounded-lg shadow-2xl z-50 mt-2 max-h-80 overflow-y-auto animate-fadeIn">
                  {suggestions.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-sky-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-0"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => {
                        navigate(`/buscar?q=${encodeURIComponent(item.name)}`);
                        setShowSuggestions(false);
                      }}
                    >
                      <img
                        src={
                          item.image
                            ? `http://localhost:4000/uploads/${item.image}`
                            : "/products/default.jpg"
                        }
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                        alt={item.name}
                      />

                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-sm text-sky-600 font-semibold">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 ml-auto">

              {/* Account Menu */}
              <div 
                ref={accountRef}
                className="text-sm cursor-pointer leading-tight relative group"
              >
                {isLogged ? (
                  <>
                    <div 
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="hover:text-sky-400 transition-colors duration-200"
                    >
                      <div>Hola, {user.name}</div>
                      <div className="font-bold flex items-center gap-1">
                        Cuenta <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {showAccountMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-2xl py-2 min-w-[200px] z-50 animate-fadeIn">
                        <div
                          onClick={() => {
                            navigate("/mis-pedidos");
                            setShowAccountMenu(false);
                          }}
                          className="px-4 py-2 hover:bg-sky-50 hover:text-sky-600 cursor-pointer transition-colors duration-150 flex items-center gap-2"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Mis pedidos
                        </div>

                        <div className="border-t border-gray-200 my-1"></div>

                        <div
                          onClick={() => {
                            logout();
                            setShowAccountMenu(false);
                            navigate("/Uniformes");
                          }}
                          className="px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors duration-150 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cerrar sesión
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent("open-login"))
                    }
                    className="hover:text-sky-400 transition-colors duration-200"
                  >
                    <div>Hola, Identifícate</div>
                    <div className="font-bold flex items-center gap-1">
                      Cuenta y Listas <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <div
                className={`relative flex items-center gap-2 cursor-pointer group ${cartBounce ? 'animate-bounce' : ''}`}
                onClick={toggleCart}
              >
                <div className="relative">
                  <ShoppingCart className="w-8 h-8 group-hover:text-sky-400 transition-colors duration-200" />

                  {totalQuantity > 0 && (
                    <span
                      className="
                        absolute -top-2 -right-2
                        bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold
                        rounded-full w-6 h-6 flex items-center justify-center
                        shadow-lg animate-pulse
                      "
                    >
                      {totalQuantity}
                    </span>
                  )}
                </div>

                <span className="font-bold text-white group-hover:text-sky-400 transition-colors duration-200">Carrito</span>
              </div>
            </div>

            {/* Mobile Cart */}
            <div
              className="lg:hidden relative flex items-center gap-1 cursor-pointer ml-auto"
              onClick={toggleCart}
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />

                {totalQuantity > 0 && (
                  <span
                    className="
                      absolute -top-2 -right-2
                      bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold
                      rounded-full w-5 h-5 flex items-center justify-center
                      shadow-lg
                    "
                  >
                    {totalQuantity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Bar */}
        {isLogged && role === "admin" && (
          <div className="bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 border-t border-gray-600 px-4 py-3">
            <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
              {adminLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium
                      transition-all duration-300 whitespace-nowrap
                      bg-linear-to-r from-gray-700 to-gray-600 text-gray-200
                      border border-gray-600
                      hover:from-sky-600 hover:to-sky-500 hover:text-white 
                      hover:border-sky-400 hover:shadow-lg hover:scale-105
                      active:scale-95
                      animate-slideIn
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
          <div 
            className="bg-white w-80 h-full shadow-2xl animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-linear-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div className="text-xl font-bold">Menú</div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {isLogged ? (
                <>
                  <div className="font-bold text-lg text-gray-800">
                    Hola, {user.name}
                  </div>
                  <button
                    onClick={() => {
                      navigate("/mis-pedidos");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-2"
                  >
                    <ClipboardList className="w-5 h-5" />
                    Mis pedidos
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/Uniformes");
                    }}
                    className="w-full text-left px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-login"));
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-linear-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all font-medium shadow-md"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            ref={modalRef}
            className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn"
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <Login />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;