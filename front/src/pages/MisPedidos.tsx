import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

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

export default function MisPedidos() {
  const { user, isLogged } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLogged || !user) return;

    const load = async () => {
      const res = await fetch(`http://localhost:4000/api/orders/user/${user.id}`);
      const data = await res.json();
      setOrders(data);
    };

    load();
  }, [isLogged, user]);

  if (!isLogged)
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Debes iniciar sesión para ver tus pedidos.
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mis pedidos</h1>

        {orders.length === 0 ? (
        <p className="text-gray-600">Aún no tienes pedidos.</p>
      ) : (
        orders.map((order: Order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 mb-6 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Pedido #{order.id}</h2>
                <p className="text-sm text-gray-600">
                  Fecha: {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">${order.total}</p>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    order.status === "completed"
                      ? "bg-green-200 text-green-700"
                      : "bg-yellow-200 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4 border-t pt-3">
                  <img
                    src={`http://localhost:4000/uploads/${item.image}`}
                    className="w-20 h-20 object-cover rounded border"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm">
                      Talla: <strong>{item.size}</strong>
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      Color:
                      <span
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.color_hex }}
                      />
                      {item.color_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm">Cantidad: {item.quantity}</p>
                    <p className="font-bold">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
