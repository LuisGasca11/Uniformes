import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Mail, Lock, Save, ArrowLeft, Package, Eye, EyeOff, Phone, MapPin, Plus, Trash2, Home, Building, Star } from "lucide-react";

interface OrderSummary {
  total_orders: number;
  total_spent: number;
}

interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  exterior_number: string;
  interior_number?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export default function Profile() {
  const { user, isLogged, logout, login } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"info" | "password" | "addresses">("info");
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({ total_orders: 0, total_spent: 0 });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!isLogged) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
      
      // Cargar resumen de pedidos
      fetchOrderSummary();
      fetchAddresses();
    }
  }, [isLogged, user, navigate]);

  const fetchOrderSummary = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:4000/api/orders/user/${user.id}`);
      const orders = await res.json();
      
      setOrderSummary({
        total_orders: orders.length,
        total_spent: orders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0),
      });
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    }
  };

  const handleDeleteAddress = async () => {
    if (!confirmDeleteId) return;
    
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4000/api/addresses/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(prev => prev.filter(a => a.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      toast.success("Dirección eliminada");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4000/api/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
      toast.success("Dirección predeterminada actualizada");
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profileForm.name, phone: profileForm.phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al actualizar perfil");
        return;
      }

      // Actualizar user en contexto
      if (user && token) {
        login(token, { ...user, name: profileForm.name, phone: profileForm.phone } as any);
      }
      
      toast.success("Perfil actualizado");
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cambiar contraseña");
        return;
      }

      toast.success("Contraseña actualizada");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (!isLogged || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500">Gestiona tu información personal</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 bg-[#009be9] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              
              {user.role === "admin" && (
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Administrador
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#009be9]" />
                    <span className="text-sm text-gray-600">Pedidos</span>
                  </div>
                  <span className="font-bold text-gray-900">{orderSummary.total_orders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[#009be9] text-lg">$</span>
                    <span className="text-sm text-gray-600">Total gastado</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${orderSummary.total_spent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-4 text-sm font-semibold transition whitespace-nowrap px-2 ${
                    activeTab === "info"
                      ? "text-[#009be9] border-b-2 border-[#009be9]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Información
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`flex-1 py-4 text-sm font-semibold transition whitespace-nowrap px-2 ${
                    activeTab === "addresses"
                      ? "text-[#009be9] border-b-2 border-[#009be9]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Direcciones
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex-1 py-4 text-sm font-semibold transition whitespace-nowrap px-2 ${
                    activeTab === "password"
                      ? "text-[#009be9] border-b-2 border-[#009be9]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Cambiar Contraseña
                </button>
              </div>

              <div className="p-6">
                {activeTab === "info" ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
                        />
                      </div>
                    </div>

                    {/* Email (solo lectura) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        El correo no se puede cambiar
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="10 dígitos"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#009be9] hover:bg-[#0089d0] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </form>
                ) : activeTab === "addresses" ? (
                  <div className="space-y-4">
                    {/* Lista de direcciones */}
                    {addresses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No tienes direcciones guardadas</p>
                        <p className="text-sm mt-1">Agrega una en el checkout</p>
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-xl border-2 ${
                            addr.is_default ? "border-[#009be9] bg-[#009be9]/5" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              addr.is_default ? "bg-[#009be9] text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              {addr.label === "Oficina" ? <Building className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{addr.label}</span>
                                {addr.is_default && (
                                  <span className="text-xs bg-[#009be9]/10 text-[#009be9] px-2 py-0.5 rounded-full">
                                    Predeterminada
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{addr.full_name}</p>
                              <p className="text-sm text-gray-500">
                                {addr.street} #{addr.exterior_number}
                                {addr.interior_number && `, Int. ${addr.interior_number}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {addr.neighborhood}, {addr.city}, {addr.state} {addr.postal_code}
                              </p>
                              <p className="text-sm text-gray-500">Tel: {addr.phone}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            {!addr.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="flex items-center gap-1 text-sm text-[#009be9] hover:underline"
                              >
                                <Star className="w-4 h-4" />
                                Predeterminada
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDeleteId(addr.id)}
                              className="flex items-center gap-1 text-sm text-red-500 hover:underline ml-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#009be9] hover:text-[#009be9] transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Agregar dirección en checkout
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    {/* Contraseña actual */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Nueva contraseña */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar nueva contraseña */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#009be9] hover:bg-[#0089d0] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Cambiar contraseña
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900">Eliminar dirección</h3>
            <p className="text-sm text-gray-600 mt-2">
              ¿Seguro que quieres eliminar esta dirección?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAddress}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
