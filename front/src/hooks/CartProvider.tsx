import { createContext, useContext, useEffect, useState } from "react";
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
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isLogged } = useAuth();

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
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      window.dispatchEvent(new CustomEvent("open-login"));
      return;
    }

    try {
      await fetch("http://localhost:4000/api/cart/add", {
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

      toast.success("Producto agregado al carrito");

      await loadCart();
      setIsOpen(true);
    } catch (err) {
      toast.error("Error al agregar producto");
      console.error(err);
    }
  };

  const removeItem = async (itemId: number) => {
    await fetch(`http://localhost:4000/api/cart/item/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    loadCart();
  };

  const toggleCart = () => setIsOpen((p) => !p);

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
