import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Item {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
  color_name?: string;
  size?: string;
}

interface Order {
  id: number;
  user_id: number;
  total: string;
  status: string;
  created_at: string;
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);

    fetch(`http://localhost:4000/api/order-items/${id}`)
      .then((r) => r.json())
      .then(setItems);
  }, [id]);

  async function updateStatus(status: string) {
    await fetch(`http://localhost:4000/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setOrder({ ...(order as Order), status });
  }

  if (!order) return <div>Cargando orden...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orden #{order.id}</CardTitle>
        </CardHeader>

        <CardContent>
          <p><strong>Usuario:</strong> {order.user_id}</p>
          <p><strong>Total:</strong> ${order.total}</p>
          <p><strong>Estatus:</strong> {order.status}</p>
          <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => updateStatus("pending")}>Pendiente</Button>
            <Button onClick={() => updateStatus("processing")}>Procesando</Button>
            <Button onClick={() => updateStatus("shipped")}>Enviado</Button>
            <Button onClick={() => updateStatus("completed")}>Completado</Button>
            <Button variant="destructive" onClick={() => updateStatus("canceled")}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos en la Orden</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Precio</th>
              </tr>
            </thead>

            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b">
                  <td>{i.product_name}</td>
                  <td>{i.quantity}</td>
                  <td>{i.color_name || "-"}</td>
                  <td>{i.size || "-"}</td>
                  <td>${i.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
