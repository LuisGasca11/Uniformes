import { useEffect, useState } from "react";

export interface Category {
  id: number;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:4000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error cargando categorías", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { categories, loading };
}
