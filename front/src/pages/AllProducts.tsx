import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import Breadcrumb from "../components/Breadcrumb";
import CategoryMenu from "../components/CategoryMenu";
import ProductsGrid from "../components/ProductsGrid";
import type { Product } from "../types/product";

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <Breadcrumb />
      <CategoryMenu />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Todos los artículos
        </h1>
        <ProductsGrid products={products} loading={loading} />
      </div>
    </div>
  );
};

export default AllProducts;