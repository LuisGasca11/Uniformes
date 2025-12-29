import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ShoppingBag,

  Box,
  Home,
  Check
} from "lucide-react";

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

// Pasos del tracking
const trackingSteps = [
  { key: "pending", label: "Pedido recibido", icon: Clock, description: "Hemos recibido tu pedido" },
  { key: "processing", label: "En preparación", icon: Box, description: "Estamos preparando tu paquete" },
  { key: "shipped", label: "Enviado", icon: Truck, description: "Tu paquete está en camino" },
  { key: "completed", label: "Entregado", icon: Home, description: "¡Pedido entregado!" },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pedido recibido", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  processing: { label: "En preparación", color: "text-blue-600", bgColor: "bg-blue-500" },
  shipped: { label: "En camino", color: "text-purple-600", bgColor: "bg-purple-500" },
  completed: { label: "Entregado", color: "text-green-600", bgColor: "bg-green-500" },
  cancelled: { label: "Cancelado", color: "text-red-600", bgColor: "bg-red-500" },
  canceled: { label: "Cancelado", color: "text-red-600", bgColor: "bg-red-500" },
};

export default function PedidoDetail() {
  const { id } = useParams();
  const { user, isLogged } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogged || !user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/orders/user/${user.id}`);
        const data = await res.json();
        const found = data.find((o: Order) => o.id === Number(id));
        setOrder(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLogged, user, id]);

  // Obtener el índice del paso actual
  const getCurrentStepIndex = (status: string) => {
    if (status === "cancelled" || status === "canceled") return -1;
    const index = trackingSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  if (!isLogged) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-600">Debes iniciar sesión para ver tus pedidos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#009be9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-600">Pedido no encontrado</p>
        <Link to="/mis-pedidos" className="mt-4 text-[#009be9] hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const currentStepIndex = getCurrentStepIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "canceled";
  const subtotal = order.items.reduce((sum, item) => sum + parseFloat(String(item.price)) * item.quantity, 0);

  // Fecha estimada de entrega (simulada: 3-5 días después del pedido)
  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(orderDate.getDate() + 5);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header fijo */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <Link
            to="/mis-pedidos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Mis pedidos
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        {/* Título y número de pedido */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Pedido</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">#{order.id}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {orderDate.toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-[#009be9]">
                ${parseFloat(String(order.total)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking visual - Compacto para móvil */}
        {!isCancelled ? (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Estado del envío</h2>
                <p className={`text-xs sm:text-sm font-semibold ${status.color}`}>{status.label}</p>
              </div>
              {order.status !== "completed" && (
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500">Entrega estimada</p>
                  <p className="font-bold text-xs sm:text-sm text-gray-900">
                    {estimatedDelivery.toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar - Más compacto */}
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 rounded-full" />
              <div 
                className="absolute top-4 left-0 h-0.5 bg-[#009be9] rounded-full transition-all duration-500"
                style={{ 
                  width: currentStepIndex === trackingSteps.length - 1 
                    ? '100%' 
                    : `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` 
                }}
              />

              <div className="relative flex justify-between">
                {trackingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                      <div 
                        className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10
                          ${isCompleted ? 'bg-[#009be9] text-white' : 'bg-gray-200 text-gray-400'}
                          ${isCurrent ? 'ring-2 ring-[#009be9]/30' : ''}
                        `}
                      >
                        {isCompleted && index < currentStepIndex ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <p className={`mt-2 text-[10px] sm:text-xs font-medium text-center leading-tight
                        ${isCompleted ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mensaje de estado actual - Compacto */}
            <div className="mt-4 p-3 bg-[#009be9]/5 rounded-lg border border-[#009be9]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#009be9] rounded-full flex items-center justify-center shrink-0">
                  {order.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : order.status === "shipped" ? (
                    <Truck className="w-4 h-4 text-white" />
                  ) : (
                    <Package className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {order.status === "completed" 
                      ? "¡Pedido entregado!" 
                      : order.status === "shipped"
                        ? "En camino"
                        : order.status === "processing"
                          ? "Preparando tu pedido"
                          : "Pedido recibido"
                    }
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {order.status === "completed"
                      ? "Gracias por tu compra"
                      : order.status === "shipped"
                        ? "Pronto llegará"
                        : "Te notificaremos"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-700">Cancelado</p>
                <p className="text-sm text-red-600">Este pedido no será procesado</p>
              </div>
            </div>
          </div>
        )}

        {/* Productos del pedido - Compacto */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-4">
          <div className="p-3 sm:p-4 border-b bg-gray-50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#009be9]" />
              Productos ({order.items.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 sm:p-4">
                <div className="flex gap-3">
                  <img
                    src={item.image ? `http://localhost:4000/uploads/${item.image}` : "/products/default.jpg"}
                    alt={item.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg border shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.size}</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.color_hex }}
                        />
                      </span>
                      <span>×{item.quantity}</span>
                    </div>
                    <p className="mt-1 font-bold text-gray-900 text-sm sm:hidden">
                      ${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="hidden sm:block text-right shrink-0">
                    <p className="font-bold text-gray-900">
                      ${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">${parseFloat(String(item.price)).toFixed(2)} c/u</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen - Compacto */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg text-[#009be9]">${parseFloat(String(order.total)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
