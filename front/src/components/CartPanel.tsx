import { useCart } from "@/hooks/CartProvider";
import { X, Trash2 } from "lucide-react";

export default function CartPanel() {
  const { isOpen, toggleCart, items, totalPrice, removeItem } = useCart();

  if (!isOpen) return null;

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
          <p className="text-gray-500 text-center mt-20 text-lg">
            Tu carrito está vacío 🛒
          </p>
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
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Talla: <span className="font-medium">{item.size}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Color: <span className="font-medium">{item.color_name}</span>
                    </p>
                    <p className="font-bold text-blue-600 mt-1">
                      ${item.price}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="
                      text-red-500 hover:text-red-600 p-2 
                      hover:bg-red-100 rounded-lg transition
                    "
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                className="
                  w-full bg-blue-600 hover:bg-blue-700 
                  text-white py-3 rounded-lg text-center 
                  font-bold text-lg transition shadow-md
                "
              >
                Proceder al pago
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
