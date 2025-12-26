import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const resProducts = await fetch("http://localhost:4000/api/products");
        const products = await resProducts.json();

        const resOrders = await fetch("http://localhost:4000/api/orders");
        const orders = await resOrders.json();

        const revenue = orders.reduce(
          (sum: number, order: any) => sum + Number(order.total || 0),
          0
        );

        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
          loading: false,
        });
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
      }
    }

    loadStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl text-white font-light animate-pulse">Cargando datos...</div>
      </div>
    );
  }

  const items = [
    {
      title: "Productos",
      value: stats.products,
      gradient: "from-cyan-400 to-blue-500",
      icon: "📦",
      label: "en inventario"
    },
    {
      title: "Órdenes",
      value: stats.orders,
      gradient: "from-orange-400 to-pink-500",
      icon: "🛒",
      label: "procesadas"
    },
    {
      title: "Ingresos",
      value: `$${stats.revenue.toLocaleString()}`,
      gradient: "from-emerald-400 to-teal-500",
      icon: "💰",
      label: "recaudados"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-black mb-3 tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <Card
              key={item.title}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className={`absolute -inset-0.5 bg-linear-to-r ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500 -z-10`}></div>

              <CardHeader className="relative z-10 pb-3 pt-8 px-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  <div className={`w-12 h-1 bg-linear-to-r ${item.gradient} rounded-full`}></div>
                </div>
                <CardTitle className="text-lg font-medium text-black uppercase tracking-widest">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 px-8 pb-8">
                <div className="space-y-3">
                  <div className="text-6xl font-black text-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-500 transition-all duration-300">
                    {item.value}
                  </div>
                  <p className="text-sm text-black font-medium">{item.label}</p>
                </div>
              </CardContent>

              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-linear-to-tl ${item.gradient} opacity-20 rounded-tl-full`}></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}