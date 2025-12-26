import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  id: number;
  user_id: number;
  total: string;
  status: string;
  created_at: string;
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando órdenes...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes</CardTitle>
      </CardHeader>

      <CardContent>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th>ID</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estatus</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td>{o.id}</td>
                <td>{o.user_id}</td>
                <td>${o.total}</td>
                <td className="capitalize">{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <Link
                    to={`/admin/orders/${o.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
