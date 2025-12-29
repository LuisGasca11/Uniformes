import { useEffect, useState } from "react";
import { Users, Mail, ShoppingBag, Search, Crown, User } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
  total_orders: number;
  total_spent: number;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        u => u.name.toLowerCase().includes(searchLower) || 
             u.email.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    customers: users.filter(u => u.role === "user").length,
    withOrders: users.filter(u => u.total_orders > 0).length
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">{stats.total} usuarios registrados</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.customers}</p>
                <p className="text-xs text-gray-500">Clientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withOrders}</p>
                <p className="text-xs text-gray-500">Con pedidos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009be9]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009be9]"
            >
              <option value="all">Todos los roles</option>
              <option value="user">Clientes</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600 hidden sm:table-cell">Rol</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Registro</th>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Último acceso</th>
                  <th className="text-center px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600">Pedidos</th>
                  <th className="text-right px-4 sm:px-6 py-4 text-sm font-semibold text-gray-600 hidden sm:table-cell">Total gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                          ${user.role === "admin" ? "bg-amber-500" : "bg-[#009be9]"}
                        `}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                          <span className={`
                            sm:hidden inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                            ${user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}
                          `}>
                            {user.role === "admin" ? "Admin" : "Cliente"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <span className={`
                        inline-flex px-3 py-1 rounded-full text-xs font-medium
                        ${user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}
                      `}>
                        {user.role === "admin" ? "Administrador" : "Cliente"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {user.last_login ? formatDate(user.last_login) : (
                        <span className="text-gray-400 italic">Nunca</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        {user.total_orders}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                      <span className="font-medium text-gray-900">
                        {formatMoney(Number(user.total_spent))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
