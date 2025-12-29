import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Settings,
  Bell,
  Plug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  LogOut,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openConfig, setOpenConfig] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cerrar sidebar móvil con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const configItems = [
    { label: "General", icon: Settings, to: "/admin/settings/general" },
    { label: "Notificaciones", icon: Bell, to: "/admin/settings/notifications" },
    { label: "Integraciones", icon: Plug, to: "/admin/settings/integrations" },
  ];

  const mainMenu = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { label: "Productos", icon: Package, to: "/admin/products" },
    { label: "Pedidos", icon: ShoppingCart, to: "/admin/orders" },
    { label: "Categorías", icon: Tags, to: "/admin/categories" },
    { label: "Usuarios", icon: Users, to: "/admin/users" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 lg:p-6 flex items-center justify-between">
        <h2
          className={cn(
            "text-lg lg:text-xl font-bold text-gray-800 drop-shadow-sm transition-all duration-300",
            isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
          )}
        >
          Admin Panel
        </h2>

        {/* Botón cerrar en móvil */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-700" />
        </button>

        {/* Botón colapsar en desktop */}
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            if (!isCollapsed) setOpenConfig(false);
          }}
          className={cn(
            `
            hidden lg:flex
            p-2 rounded-lg 
            bg-white/60 hover:bg-white/80 
            border border-white/40
            shadow-sm hover:shadow-md
            transition-all duration-200
            active:scale-95
            `,
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} className="text-gray-700" />
          ) : (
            <ChevronLeft size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      <nav className="flex flex-col px-4 gap-1">
        {mainMenu.map((item) => {
          const isActive = pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                `
                flex items-center gap-3 p-3 rounded-lg transition-all 
                hover:bg-white/50 hover:backdrop-blur-2xl
                border border-transparent
                group relative
                `,
                isActive &&
                  "bg-white/60 backdrop-blur-xl border-white/40 shadow-sm font-medium",
                isCollapsed && "lg:justify-center"
              )}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={20} className="shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
              >
                {item.label}
              </span>

              {isCollapsed && (
                <div
                  className="
                    hidden lg:block
                    absolute left-full ml-2 px-3 py-2 
                    bg-gray-900 text-white text-sm rounded-lg
                    opacity-0 group-hover:opacity-100
                    pointer-events-none
                    transition-opacity duration-200
                    whitespace-nowrap
                    shadow-lg
                  "
                >
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-4">
        <button
          onClick={() => setOpenConfig(!openConfig)}
          disabled={isCollapsed}
          className={cn(
            `
            flex items-center justify-between 
            w-full p-3 rounded-lg 
            hover:bg-white/50 hover:backdrop-blur-xl
            transition-all
            group relative
            `,
            isCollapsed && "lg:justify-center lg:cursor-not-allowed lg:opacity-50"
          )}
          title={isCollapsed ? "Configuración (expandir para ver opciones)" : ""}
        >
          <span
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "lg:justify-center"
            )}
          >
            <Settings size={20} className="shrink-0" />
            <span
              className={cn(
                "transition-all duration-300 whitespace-nowrap",
                isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
              )}
            >
              Configuración
            </span>
          </span>

          {!isCollapsed && (
            <ChevronDown
              className={cn(
                "transition-transform duration-300",
                openConfig && "rotate-180"
              )}
            />
          )}

          {isCollapsed && (
            <div
              className="
                hidden lg:block
                absolute left-full ml-2 px-3 py-2 
                bg-gray-900 text-white text-sm rounded-lg
                opacity-0 group-hover:opacity-100
                pointer-events-none
                transition-opacity duration-200
                whitespace-nowrap
                shadow-lg
              "
            >
              Configuración
            </div>
          )}
        </button>

        {(!isCollapsed || isMobileOpen) && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              openConfig ? "max-h-96 mt-1 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="ml-3 flex flex-col gap-1 pt-2">
              {configItems.map((item, index) => {
                const isActive = pathname.startsWith(item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      `
                      flex items-center gap-3 p-2 rounded-md text-sm
                      hover:bg-white/50 hover:backdrop-blur-xl
                      transition-all
                      border border-transparent
                      opacity-0 translate-x-2
                      `,
                      isActive &&
                        "bg-white/60 backdrop-blur-xl border-white/40 shadow-sm font-medium",
                      openConfig && "opacity-100 translate-x-0"
                    )}
                    style={{
                      transitionDelay: openConfig ? `${index * 50}ms` : "0ms",
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Botones de navegación al final */}
      <div className="px-4 pb-4 mt-4 border-t border-gray-200 pt-4 space-y-2">
        <Link
          to="/"
          className={cn(
            `
            flex items-center gap-3 p-3 rounded-lg transition-all 
            hover:bg-blue-50 text-blue-600
            group relative
            `,
            isCollapsed && "lg:justify-center"
          )}
          title="Ir al inicio"
        >
          <Home size={20} className="shrink-0" />
          <span
            className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            )}
          >
            Ir al inicio
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className={cn(
            `
            flex items-center gap-3 p-3 rounded-lg transition-all w-full
            hover:bg-red-50 text-red-600
            group relative
            `,
            isCollapsed && "lg:justify-center"
          )}
          title="Cerrar sesión"
        >
          <LogOut size={20} className="shrink-0" />
          <span
            className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
            )}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="
          lg:hidden fixed top-4 left-4 z-40
          p-2 rounded-lg bg-white shadow-md border border-gray-200
          hover:bg-gray-50 transition-colors
        "
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={cn(
          `
          lg:hidden fixed inset-y-0 left-0 z-50
          w-72 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          `,
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside
        className={cn(
          `
          hidden lg:flex
          h-screen
          backdrop-blur-xl bg-white/40 border-r border-white/30
          shadow-[0_0_25px_rgba(0,0,0,0.05)]
          flex-col
          sticky top-0 z-20
          transition-all duration-300 ease-in-out
          `,
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />

        {isCollapsed && (
          <div className="mt-auto p-4 flex justify-center">
            <div className="w-8 h-1 bg-linear-to-r from-transparent via-gray-900 to-transparent rounded-full"></div>
          </div>
        )}
      </aside>
    </>
  );
}