import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, ChevronRight } from "lucide-react";

interface OrderItem {
  id: number;
  image: string;
  name: string;
  size: string;
  color_hex: string;
  color_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  total: number;
  status: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "text-yellow-700", bg: "bg-yellow-100", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: "Procesando", color: "text-blue-700", bg: "bg-blue-100", icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { label: "Enviado", color: "text-purple-700", bg: "bg-purple-100", icon: <Truck className="w-3.5 h-3.5" /> },
  completed: { label: "Entregado", color: "text-green-700", bg: "bg-green-100", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100", icon: <XCircle className="w-3.5 h-3.5" /> },
  canceled: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function MisPedidos() {
  const { user, isLogged } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogged || !user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/orders/user/${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLogged, user]);

  if (!isLogged) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-600 text-center">Inicia sesión para ver tus pedidos</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-2 bg-[#009be9] text-white rounded-lg font-medium hover:bg-[#0089d0]"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#009be9] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(String(price)));
  };

  return (
    <div className="min-h-[60vh] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mis pedidos</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-600 mb-2">Aún no tienes pedidos</p>
            <p className="text-gray-500 text-sm mb-4">¡Explora nuestros productos!</p>
            <Link
              to="/todos-los-productos"
              className="inline-block px-6 py-2 bg-[#009be9] text-white rounded-lg font-medium hover:bg-[#0089d0]"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <Link
                  to={`/mis-pedidos/${order.id}`}
                  key={order.id}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#009be9] transition-all"
                >
                  {/* Header compacto */}
                  <div className="p-3 sm:p-4 border-b bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Fecha y Total */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-[10px] sm:text-xs text-gray-500 uppercase block">Pedido realizado</span>
                          <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {new Date(order.created_at).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-xs text-gray-500 uppercase block">Total</span>
                          <span className="font-bold text-[#009be9] text-sm">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Status y Número */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${status.bg} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] sm:text-xs text-gray-500 uppercase block">Nº de pedido</span>
                          <span className="font-mono font-semibold text-xs sm:text-sm">#{order.id}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Productos - Layout responsive */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item: OrderItem) => (
                      <div key={item.id} className="p-3 sm:p-4">
                        <div className="flex gap-3">
                          {/* Imagen */}
                          <img
                            src={item.image ? `http://localhost:4000/uploads/${item.image}` : "/products/default.jpg"}
                            alt={item.name}
                            className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg border shrink-0"
                          />

                          {/* Info del producto */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{item.name}</p>
                            
                            {/* Detalles compactos */}
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                {item.size}
                              </span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.color_hex }}
                                />
                                <span className="hidden xs:inline">{item.color_name}</span>
                              </span>
                              <span className="text-gray-400">×{item.quantity}</span>
                            </div>

                            {/* Precio en móvil */}
                            <p className="mt-1 font-bold text-gray-900 text-sm sm:hidden">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Precio - solo desktop */}
                          <div className="hidden sm:block text-right shrink-0">
                            <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">{formatPrice(item.price)} c/u</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
