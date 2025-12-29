import { useCart } from "@/hooks/CartProvider";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function CartPanel() {
  const { isOpen, toggleCart, items, totalPrice, removeItem, updateQuantity } = useCart();
  const { isLogged } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    toggleCart();
    if (!isLogged) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={toggleCart}
      />

      <div
        className="
          w-96 bg-white h-full shadow-2xl p-6 overflow-y-auto 
          animate-slide-left flex flex-col
        "
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold">Tu carrito</h2>
          <button
            onClick={toggleCart}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-1">¡Agrega productos para comenzar!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="
                    flex gap-3 p-3 rounded-lg border hover:shadow-md 
                    transition bg-white
                  "
                >
                  <img
                    src={`http://localhost:4000/uploads/${item.image}`}
                    className="w-20 h-20 rounded-lg object-cover border"
                    alt={item.name}
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Talla: <span className="font-medium">{item.size}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Color: <span className="font-medium">{item.color_name}</span>
                    </p>
                    <p className="font-bold text-[#009be9] mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="
                      text-red-500 hover:text-red-600 p-2 
                      hover:bg-red-100 rounded-lg transition h-fit
                    "
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold mb-2">
                <span>Subtotal:</span>
                <span className="text-[#009be9]">${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Envío e impuestos calculados en el checkout
              </p>

              <button
                onClick={handleCheckout}
                className="
                  w-full bg-[#009be9] hover:bg-[#0088cc]
                  text-white py-3 rounded-xl text-center 
                  font-bold text-lg transition shadow-lg
                  flex items-center justify-center gap-2
                "
              >
                Proceder al pago
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
