import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/CartProvider";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Plus,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  Package,
  X,
  Check,
  Home,
  Building,
  Loader2,
} from "lucide-react";

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
  country: string;
  references_text?: string;
  is_default: boolean;
}

// CartItem viene del CartProvider, no necesitamos redefinirlo aquí

export default function Checkout() {
  const { user, isLogged } = useAuth();
  const { items: cartItems, totalQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [notes, setNotes] = useState("");

  // Form de dirección
  const [addressForm, setAddressForm] = useState({
    label: "Casa",
    full_name: user?.name || "",
    phone: "",
    street: "",
    exterior_number: "",
    interior_number: "",
    neighborhood: "",
    city: "",
    state: "",
    postal_code: "",
    references_text: "",
  });

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 500 ? 0 : 99;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (!isLogged) {
      toast.error("Debes iniciar sesión para continuar");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      navigate("/uniformes");
      return;
    }

    fetchAddresses();
  }, [isLogged, cartItems.length, navigate]);

  useEffect(() => {
    if (user?.name) {
      setAddressForm(prev => ({ ...prev, full_name: user.name }));
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAddresses(data);
      
      // Seleccionar dirección por defecto
      const defaultAddr = data.find((a: Address) => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!addressForm.full_name || !addressForm.phone || !addressForm.street || 
        !addressForm.exterior_number || !addressForm.neighborhood || 
        !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addressForm,
          is_default: addresses.length === 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Error al guardar dirección");
        return;
      }

      const newAddress = await res.json();
      setAddresses(prev => [...prev, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      toast.success("Dirección guardada");
      
      // Reset form
      setAddressForm({
        label: "Casa",
        full_name: user?.name || "",
        phone: "",
        street: "",
        exterior_number: "",
        interior_number: "",
        neighborhood: "",
        city: "",
        state: "",
        postal_code: "",
        references_text: "",
      });
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Selecciona una dirección de envío");
      setStep("address");
      return;
    }

    setProcessingOrder(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_id: selectedAddress.id,
          payment_method: paymentMethod,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al procesar el pedido");
        return;
      }

      // Confirmar pago según método (Stripe se integrará después)
      // Por ahora todos los métodos excepto "cash" se marcan como pagados
      if (paymentMethod !== "cash") {
        await fetch("http://localhost:4000/api/checkout/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: data.id,
            payment_method: paymentMethod,
          }),
        });
      }

      clearCart();
      
      // Mensaje según método de pago
      if (paymentMethod === "cash") {
        toast.success("¡Pedido creado! Pagarás al recibir");
      } else if (paymentMethod === "oxxo") {
        toast.success("¡Pedido creado! Te enviaremos los datos de pago");
      } else if (paymentMethod === "transfer") {
        toast.success("¡Pedido creado! Te enviaremos los datos bancarios");
      } else {
        toast.success("¡Pedido realizado con éxito!");
      }
      
      navigate(`/pedido/${data.id}`);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setProcessingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  if (!isLogged || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/uniformes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Seguir comprando</span>
            </Link>
            <h1 className="text-lg font-bold">Checkout</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { key: "address", label: "Envío", icon: MapPin },
              { key: "payment", label: "Pago", icon: CreditCard },
              { key: "confirm", label: "Confirmar", icon: ShieldCheck },
            ].map((s, index) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.key === "address" || (s.key === "payment" && selectedAddress) || 
                        (s.key === "confirm" && selectedAddress)) {
                      setStep(s.key as typeof step);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition
                    ${step === s.key 
                      ? "bg-[#009be9] text-white" 
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  <s.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>
                {index < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Dirección */}
            {step === "address" && (
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#009be9]" />
                  Dirección de envío
                </h2>

                {/* Lista de direcciones */}
                {addresses.length > 0 && !showAddressForm && (
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition
                          ${selectedAddress?.id === addr.id 
                            ? "border-[#009be9] bg-[#009be9]/5" 
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                            ${selectedAddress?.id === addr.id ? "bg-[#009be9] text-white" : "bg-gray-100 text-gray-500"}`}>
                            {addr.label === "Oficina" ? <Building className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
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
                          {selectedAddress?.id === addr.id && (
                            <Check className="w-5 h-5 text-[#009be9] shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón agregar dirección */}
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#009be9] hover:text-[#009be9] transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar nueva dirección
                  </button>
                )}

                {/* Formulario de dirección */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Nueva dirección</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tipo de dirección */}
                    <div className="flex gap-2">
                      {["Casa", "Oficina", "Otro"].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setAddressForm(prev => ({ ...prev, label }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition
                            ${addressForm.label === label 
                              ? "bg-[#009be9] text-white" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                          placeholder="Nombre de quien recibe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                          placeholder="10 dígitos"
                        />
                      </div>
                    </div>

                    {/* Aquí irá el autocompletado de Google Places */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle *
                      </label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                        placeholder="Nombre de la calle"
                        // TODO: Integrar Google Places Autocomplete aquí
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número exterior *
                        </label>
                        <input
                          type="text"
                          value={addressForm.exterior_number}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, exterior_number: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                          placeholder="#123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número interior
                        </label>
                        <input
                          type="text"
                          value={addressForm.interior_number}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, interior_number: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                          placeholder="Depto, oficina..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Colonia *
                      </label>
                      <input
                        type="text"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                        placeholder="Nombre de la colonia"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          C.P. *
                        </label>
                        <input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent"
                          placeholder="00000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencias (opcional)
                      </label>
                      <textarea
                        value={addressForm.references_text}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, references_text: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Ej: Casa azul, junto a la tienda..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#009be9] hover:bg-[#0089d0] text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar dirección"
                      )}
                    </button>
                  </form>
                )}

                {/* Botón continuar */}
                {!showAddressForm && selectedAddress && (
                  <button
                    onClick={() => setStep("payment")}
                    className="w-full mt-4 py-3 bg-[#009be9] hover:bg-[#0089d0] text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    Continuar al pago
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Método de pago */}
            {step === "payment" && (
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#009be9]" />
                  Método de pago
                </h2>

                <div className="space-y-3">
                  {[
                    { id: "card", label: "Tarjeta de crédito/débito", desc: "Visa, Mastercard, AMEX" },
                    { id: "oxxo", label: "Pago en OXXO", desc: "Paga en efectivo" },
                    { id: "transfer", label: "Transferencia bancaria", desc: "SPEI" },
                    { id: "cash", label: "Pago contra entrega", desc: "Efectivo al recibir" },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-4
                        ${paymentMethod === method.id 
                          ? "border-[#009be9] bg-[#009be9]/5" 
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 text-[#009be9]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* TODO: Aquí irá el formulario de Stripe Elements para tarjeta */}
                {paymentMethod === "card" && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-700">
                      💡 <strong>Stripe próximamente:</strong> El pago con tarjeta estará disponible pronto. 
                      Por ahora puedes seleccionar otro método de pago.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep("address")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="flex-1 py-3 bg-[#009be9] hover:bg-[#0089d0] text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    Revisar pedido
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmar pedido */}
            {step === "confirm" && (
              <div className="space-y-4">
                {/* Resumen de envío */}
                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#009be9]" />
                      Enviar a
                    </h3>
                    <button
                      onClick={() => setStep("address")}
                      className="text-[#009be9] text-sm font-medium hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  {selectedAddress && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{selectedAddress.full_name}</p>
                      <p>{selectedAddress.street} #{selectedAddress.exterior_number}</p>
                      <p>{selectedAddress.neighborhood}, {selectedAddress.city}, {selectedAddress.state}</p>
                      <p>C.P. {selectedAddress.postal_code} | Tel: {selectedAddress.phone}</p>
                    </div>
                  )}
                </div>

                {/* Método de pago seleccionado */}
                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#009be9]" />
                      Método de pago
                    </h3>
                    <button
                      onClick={() => setStep("payment")}
                      className="text-[#009be9] text-sm font-medium hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <p className="text-gray-600">
                    {paymentMethod === "card" && "💳 Tarjeta de crédito/débito"}
                    {paymentMethod === "oxxo" && "🏪 Pago en OXXO"}
                    {paymentMethod === "transfer" && "🏦 Transferencia bancaria"}
                    {paymentMethod === "cash" && "💵 Pago contra entrega"}
                  </p>
                </div>

                {/* Notas */}
                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Notas del pedido (opcional)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009be9] focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Instrucciones especiales para el pedido..."
                  />
                </div>

                {/* Productos */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#009be9]" />
                      Productos ({totalQuantity})
                    </h3>
                  </div>
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-4 flex gap-3">
                        <img
                          src={item.image ? `http://localhost:4000/uploads/${item.image}` : "/products/default.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.size} • {item.color_name} • Cant: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("payment")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processingOrder}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Confirmar pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 sticky top-32">
              <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQuantity} productos)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-500">
                    ¡Agrega {formatPrice(500 - subtotal)} más para envío gratis!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-[#009be9]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Beneficios */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Envío gratis arriba de $500</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Compra segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
