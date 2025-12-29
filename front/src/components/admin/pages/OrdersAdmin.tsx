import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Package, Clock, CheckCircle, XCircle, Truck, Trash2 } from "lucide-react";

interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  total: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-4 h-4" /> },
  processing: { label: "Procesando", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Package className="w-4 h-4" /> },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck className="w-4 h-4" /> },
  completed: { label: "Completado", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-4 h-4" /> },
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch("http://localhost:4000/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta orden?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== id));
      } else {
        alert("Error al eliminar la orden");
      }
    } catch (error) {
      alert("Error al eliminar la orden");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Órdenes</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Package className="w-5 h-5" />
          <span>{orders.length} órdenes en total</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700">ID</th>
              <th className="p-4 font-semibold text-gray-700">Usuario</th>
              <th className="p-4 font-semibold text-gray-700">Total</th>
              <th className="p-4 font-semibold text-gray-700">Estatus</th>
              <th className="p-4 font-semibold text-gray-700">Fecha</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay órdenes registradas.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const status = statusConfig[o.status] || statusConfig.pending;
                return (
                  <tr key={o.id} className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-bold text-gray-500">#{o.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{o.customer_name || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">{o.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#009be9]">${parseFloat(o.total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(o.created_at).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#009be9] text-white text-sm font-semibold hover:bg-[#0088cc] transition shadow"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </Link>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition shadow"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
