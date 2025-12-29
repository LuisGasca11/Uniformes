import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    slug?: string;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLogged } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar wishlist cuando el usuario está logueado
  useEffect(() => {
    if (isLogged && user) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isLogged, user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error al cargar wishlist:", error);
    }
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.product_id === productId);
  };

  const addToWishlist = async (productId: number) => {
    if (!isLogged) {
      toast.error("Regístrate para agregar favoritos");
      navigate("/registro");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        await fetchWishlist();
        toast.success("Agregado a favoritos ❤️");
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al agregar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success("Eliminado de favoritos");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        items, 
        isInWishlist, 
        addToWishlist, 
        removeFromWishlist, 
        toggleWishlist,
        loading 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside <WishlistProvider>");
  return ctx;
};
