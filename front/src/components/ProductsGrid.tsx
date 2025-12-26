import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

const ProductsGrid = ({ products, loading }: { products: Product[]; loading: boolean }) => {
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto justify-center px-4 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  </div>
  );
};


export default ProductsGrid;
