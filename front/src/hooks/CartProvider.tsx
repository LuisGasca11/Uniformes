import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

interface CartItem {
  id: number;
  product_id: number;
  variant_id: number;
  name: string;
  price: number;
  image: string | null;
  color_hex: string;
  color_name: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isOpen: boolean;
  toggleCart: () => void;
  addToCart: (product_id: number, variant_id: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  checkout: () => Promise<{ success: boolean; orderId?: number }>;
  loadCart: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isLogged } = useAuth();
  const navigate = useNavigate();

  const loadCart = async () => {
    if (!isLogged) {
      setItems([]);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error("Cart error:", e);
      setItems([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isLogged]);

  const addToCart = async (product_id: number, variant_id: number, quantity: number) => {
    if (!isLogged) {
      toast.error("Debes registrarte para agregar productos al carrito");
      navigate("/registro");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id,
          variant_id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al agregar producto");
        return;
      }

      toast.success("Producto agregado al carrito");

      await loadCart();
      setIsOpen(true);
    } catch (err) {
      toast.error("Error al agregar producto");
      console.error(err);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    try {
      const res = await fetch(`http://localhost:4000/api/cart/item/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al actualizar cantidad");
        return;
      }

      await loadCart();
    } catch (err) {
      toast.error("Error al actualizar cantidad");
      console.error(err);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await fetch(`http://localhost:4000/api/cart/item/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Producto eliminado del carrito");
      loadCart();
    } catch (err) {
      toast.error("Error al eliminar producto");
      console.error(err);
    }
  };

  const checkoutCart = async (): Promise<{ success: boolean; orderId?: number }> => {
    try {
      const res = await fetch("http://localhost:4000/api/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al procesar la orden");
        return { success: false };
      }

      toast.success("¡Orden creada exitosamente!");
      await loadCart();
      setIsOpen(false);
      
      return { success: true, orderId: data.orderId };
    } catch (err) {
      toast.error("Error al procesar la orden");
      console.error(err);
      return { success: false };
    }
  };

  const toggleCart = () => setIsOpen((p) => !p);
  const clearCart = () => setItems([]);

  const totalQuantity = items.reduce((t, x) => t + x.quantity, 0);
  const totalPrice = items.reduce((t, x) => t + x.quantity * x.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        totalPrice,
        isOpen,
        toggleCart,
        addToCart,
        removeItem,
        updateQuantity,
        checkout: checkoutCart,
        loadCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
