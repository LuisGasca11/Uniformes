import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [openConfig, setOpenConfig] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const configItems = [
    { label: "General", icon: Settings, to: "/admin/settings/general" },
    { label: "Notificaciones", icon: Bell, to: "/admin/settings/notifications" },
    { label: "Integraciones", icon: Plug, to: "/admin/settings/integrations" },
  ];

  const mainMenu = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { label: "Productos", icon: Package, to: "/admin/products" },
  ];

  return (
    <>
      <aside
        className={cn(
          `
          h-screen
          backdrop-blur-xl bg-white/40 border-r border-white/30
          shadow-[0_0_25px_rgba(0,0,0,0.05)]
          flex flex-col
          sticky top-0 z-20
          transition-all duration-300 ease-in-out
          `,
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h2
            className={cn(
              "text-xl font-bold text-gray-800 drop-shadow-sm transition-all duration-300",
              isCollapsed && "opacity-0 w-0 overflow-hidden"
            )}
          >
            Admin Panel
          </h2>

          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) setOpenConfig(false);
            }}
            className={cn(
              `
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
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : ""}
              >
                <Icon size={20} className="shrink-0" />
                <span
                  className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    isCollapsed && "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  {item.label}
                </span>

                {isCollapsed && (
                  <div
                    className="
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
              isCollapsed && "justify-center cursor-not-allowed opacity-50"
            )}
            title={isCollapsed ? "Configuración (expandir para ver opciones)" : ""}
          >
            <span
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}
            >
              <Settings size={20} className="shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed && "opacity-0 w-0 overflow-hidden"
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

          {!isCollapsed && (
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

        {isCollapsed && (
          <div className="mt-auto p-4 flex justify-center">
            <div className="w-8 h-1 bg-linear-to-r from-transparent via-gray-900 to-transparent rounded-full"></div>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}