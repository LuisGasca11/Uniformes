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
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>

        <Link to="/admin/products/new">
          <Button>+ Nuevo Producto</Button>
        </Link>
      </div>

      <DataTable data={products} />
    </div>
  );
}
