import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DataTable from "../components/DataTable";
import { Link } from "react-router-dom";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Productos</h1>

        <Link to="/admin/products/new">
          <Button className="bg-[#009be9] text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-[#0088cc] transition-all duration-200">
            + Nuevo Producto
          </Button>
        </Link>
      </div>

      <DataTable data={products} />
    </div>
  );
}
