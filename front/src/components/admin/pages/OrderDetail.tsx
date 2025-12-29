import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, User, Calendar, DollarSign, Package, Clock, CheckCircle, XCircle, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
  color_name?: string;
  color_hex?: string;
  size?: string;
  image?: string;
}

interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  total: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "text-yellow-700", bgColor: "bg-yellow-100 border-yellow-200", icon: <Clock className="w-5 h-5" /> },
  processing: { label: "Procesando", color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200", icon: <Package className="w-5 h-5" /> },
  shipped: { label: "Enviado", color: "text-purple-700", bgColor: "bg-purple-100 border-purple-200", icon: <Truck className="w-5 h-5" /> },
  completed: { label: "Completado", color: "text-green-700", bgColor: "bg-green-100 border-green-200", icon: <CheckCircle className="w-5 h-5" /> },
  cancelled: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100 border-red-200", icon: <XCircle className="w-5 h-5" /> },
  canceled: { label: "Cancelado", color: "text-red-700", bgColor: "bg-red-100 border-red-200", icon: <XCircle className="w-5 h-5" /> },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:4000/api/orders/${id}`).then((r) => r.json()),
      fetch(`http://localhost:4000/api/order-items/${id}`).then((r) => r.json()),
    ])
      .then(([orderData, itemsData]) => {
        setOrder(orderData);
        setItems(itemsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    try {
      await fetch(`http://localhost:4000/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setOrder({ ...(order as Order), status });
      toast.success(`Estado actualizado a: ${statusConfig[status]?.label || status}`);
    } catch {
      toast.error("Error al actualizar el estado");
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando orden...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-gray-600 text-lg">Orden no encontrada</p>
        <Link to="/admin/orders" className="mt-4 text-[#009be9] hover:underline">
          Volver a órdenes
        </Link>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a órdenes
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Orden #{order.id}
          </h1>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${currentStatus.bgColor} ${currentStatus.color}`}>
            {currentStatus.icon}
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info de la orden */}
        <div className="lg:col-span-1 space-y-6">
          {/* Detalles */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles de la orden</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-semibold">{order.customer_name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400">{order.customer_email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#009be9]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#009be9]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-2xl text-[#009be9]">${parseFloat(order.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cambiar estado</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateStatus("pending")}
                disabled={order.status === "pending"}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  order.status === "pending"
                    ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                Pendiente
              </button>
              <button
                onClick={() => updateStatus("processing")}
                disabled={order.status === "processing"}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  order.status === "processing"
                    ? "bg-blue-200 text-blue-800 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Procesando
              </button>
              <button
                onClick={() => updateStatus("shipped")}
                disabled={order.status === "shipped"}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  order.status === "shipped"
                    ? "bg-purple-200 text-purple-800 cursor-not-allowed"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                Enviado
              </button>
              <button
                onClick={() => updateStatus("completed")}
                disabled={order.status === "completed"}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  order.status === "completed"
                    ? "bg-green-200 text-green-800 cursor-not-allowed"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Completado
              </button>
              <button
                onClick={() => updateStatus("cancelled")}
                disabled={order.status === "cancelled" || order.status === "canceled"}
                className={`col-span-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  order.status === "cancelled" || order.status === "canceled"
                    ? "bg-red-200 text-red-800 cursor-not-allowed"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                Cancelar orden
              </button>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos ({items.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay productos en esta orden.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                    {/* Imagen */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={`http://localhost:4000/uploads/${item.image}`}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {item.size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            Talla: {item.size}
                          </span>
                        )}
                        {item.color_name && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.color_hex || "#ccc" }}
                            />
                            {item.color_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Cant.</p>
                      <p className="font-bold">{item.quantity}</p>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Precio</p>
                      <p className="font-bold text-[#009be9]">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} productos)</span>
                  <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[#009be9]">${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
