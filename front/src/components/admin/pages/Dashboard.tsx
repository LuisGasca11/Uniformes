 import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Receipt, Wallet, UserCircle2, LineChart, Flame, Clock, Gauge } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  salesByMonth: { month: string; month_name: string; orders: number; revenue: number }[];
  topProducts: { id: number; name: string; total_sold: number; total_revenue: number }[];
  recentOrders: { 
    id: number; 
    total: number; 
    status: string; 
    created_at: string;
    customer_name: string;
    customer_email: string;
  }[];
  ordersByStatus: { status: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0,
    loading: true,
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem("token");
        
        const resProducts = await fetch("http://localhost:4000/api/products");
        const products = await resProducts.json();

        const resOrders = await fetch("http://localhost:4000/api/orders");
        const orders = await resOrders.json();

        const revenue = orders.reduce(
          (sum: number, order: any) => sum + Number(order.total || 0),
          0
        );

        // Cargar estadísticas del dashboard
        const dashRes = await fetch("http://localhost:4000/api/users/stats/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setDashboardStats(dashData);
          setStats({
            products: products.length,
            orders: orders.length,
            revenue,
            users: dashData.totalUsers || 0,
            loading: false,
          });
        } else {
          setStats({
            products: products.length,
            orders: orders.length,
            revenue,
            users: 0,
            loading: false,
          });
        }
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-green-100 text-green-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
      completed: "Completado"
    };
    return labels[status] || status;
  };

  const getStatusBarColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
      completed: "bg-green-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600 font-light animate-pulse">Cargando datos...</div>
      </div>
    );
  }

  const items = [
    {
      title: "Productos",
      value: stats.products,
      gradient: "from-cyan-400 to-blue-500",
      icon: Shirt,
      iconColor: "text-cyan-500",
      label: "en inventario"
    },
    {
      title: "Órdenes",
      value: stats.orders,
      gradient: "from-orange-400 to-pink-500",
      icon: Receipt,
      iconColor: "text-orange-500",
      label: "procesadas"
    },
    {
      title: "Ingresos",
      value: formatMoney(stats.revenue),
      gradient: "from-emerald-400 to-teal-500",
      icon: Wallet,
      iconColor: "text-emerald-500",
      label: "recaudados"
    },
    {
      title: "Usuarios",
      value: stats.users,
      gradient: "from-violet-400 to-purple-500",
      icon: UserCircle2,
      iconColor: "text-violet-500",
      label: dashboardStats?.newUsersThisMonth ? `+${dashboardStats.newUsersThisMonth} este mes` : "registrados"
    },
  ];

  const maxRevenue = dashboardStats?.salesByMonth?.length 
    ? Math.max(...dashboardStats.salesByMonth.map(s => Number(s.revenue)))
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-black mb-3 tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8">
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
              
              <CardHeader className="relative z-10 pb-2 pt-4 sm:pt-8 px-4 sm:px-8">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-xl bg-linear-to-br ${item.gradient} bg-opacity-20`}>
                    <item.icon className="w-6 h-6 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className={`w-8 sm:w-12 h-1 bg-linear-to-r ${item.gradient} rounded-full`}></div>
                </div>
                <CardTitle className="text-xs sm:text-lg font-medium text-black uppercase tracking-widest">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 px-4 sm:px-8 pb-4 sm:pb-8">
                <div className="space-y-1 sm:space-y-3">
                  <div className="text-2xl sm:text-5xl font-black text-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-gray-800 group-hover:to-gray-500 transition-all duration-300">
                    {item.value}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{item.label}</p>
                </div>
              </CardContent>

              <div className={`absolute bottom-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-linear-to-tl ${item.gradient} opacity-20 rounded-tl-full`}></div>
            </Card>
          ))}
        </div>

        {/* Gráficas y más datos */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
          {/* Ventas por mes */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2"><LineChart className="w-5 h-5 text-cyan-500" /> Ventas por mes</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats?.salesByMonth && dashboardStats.salesByMonth.length > 0 ? (
                <div className="h-64 flex items-end justify-around gap-2">
                  {dashboardStats.salesByMonth.map((month, i) => {
                    const height = maxRevenue > 0 ? (Number(month.revenue) / maxRevenue) * 100 : 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatMoney(Number(month.revenue))}
                        </span>
                        <div 
                          className="w-full bg-linear-to-t from-cyan-400 to-blue-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                        <span className="text-xs text-gray-600 font-medium">{month.month_name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No hay datos de ventas
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos más vendidos */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Productos más vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats?.topProducts && dashboardStats.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.topProducts.map((product, i) => {
                    const maxSold = Math.max(...dashboardStats.topProducts.map(p => Number(p.total_sold)));
                    const width = (Number(product.total_sold) / maxSold) * 100;
                    const gradients = [
                      "from-cyan-400 to-blue-500",
                      "from-orange-400 to-pink-500",
                      "from-emerald-400 to-teal-500",
                      "from-violet-400 to-purple-500",
                      "from-amber-400 to-orange-500"
                    ];
                    return (
                      <div key={product.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
                            {i + 1}. {product.name}
                          </span>
                          <span className="text-sm text-gray-500">{product.total_sold} vendidos</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-linear-to-r ${gradients[i % gradients.length]} rounded-full transition-all duration-500`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No hay datos de productos
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pedidos recientes y estado */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Pedidos recientes */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> Pedidos recientes</CardTitle>
              <Link to="/admin/orders" className="text-sm text-cyan-500 hover:underline font-medium">
                Ver todos
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardStats?.recentOrders && dashboardStats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900">{formatMoney(Number(order.total))}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No hay pedidos recientes
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado de pedidos */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black flex items-center gap-2"><Gauge className="w-5 h-5 text-green-500" /> Estado de pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats?.ordersByStatus && dashboardStats.ordersByStatus.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.ordersByStatus.map((item) => {
                    const total = dashboardStats.ordersByStatus.reduce((sum, s) => sum + Number(s.count), 0);
                    const percentage = total > 0 ? (Number(item.count) / total) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="text-sm text-gray-600">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getStatusBarColor(item.status)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No hay datos de pedidos
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
