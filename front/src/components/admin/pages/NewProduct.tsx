import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../components/ProductForm";
import ImageUploader from "../components/ImageUploader";
import VariantManager from "../components/VariantManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

export default function NewProduct() {
  const [product, setProduct] = useState<any>({
    name: "",
    description: "",
    price: 0,
    category_id: "",
  });

  const [createdProduct, setCreatedProduct] = useState<any>(null);

 const save = async () => {
  try {
    const res = await fetch("http://localhost:4000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      return Swal.fire({
        title: "Error al crear",
        text: "No se pudo crear el producto.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }

    const data = await res.json();
    setCreatedProduct(data);

    Swal.fire({
      title: "Producto creado",
      text: "Ahora puedes agregar imágenes y variantes.",
      icon: "success",
      confirmButtonText: "Continuar",
      timer: 1800,
    });

  } catch (error) {
    console.error(error);
    Swal.fire({
      title: "Error inesperado",
      text: "Algo salió mal al guardar el producto.",
      icon: "error",
    });
  }
};


  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-10 px-4 space-y-8">

      <div className="w-full max-w-7xl">
        <Button variant="outline" className="mb-4 rounded-xl border-gray-300 hover:bg-gray-50 transition-all" asChild>
          <a href="/admin/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a productos
          </a>
        </Button>
      </div>

      {/* FORMULARIO */}
      <Card className="w-full max-w-7xl shadow-lg border border-gray-100 bg-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-gray-900">
            Completa la información principal del nuevo producto.
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ProductForm product={product} setProduct={setProduct} onSubmit={save} />
        </CardContent>
      </Card>


      {createdProduct && (
        <div className="w-full max-w-4xl space-y-8">

          {/* SUBIR IMÁGENES */}
          <Card className="shadow-lg border border-gray-100 bg-white rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Imágenes del producto</h2>
            <ImageUploader
              productId={createdProduct.id}
              onUploaded={(img) => {
                setCreatedProduct({
                  ...createdProduct,
                  images: [...(createdProduct.images ?? []), img],
                });
              }}
            />
          </Card>

          {/* VARIANTES */}
          <Card className="shadow-lg border border-gray-100 bg-white rounded-2xl p-6">
            <VariantManager
              product={createdProduct}
              setProduct={setCreatedProduct}
              productId={createdProduct.id}
            />
          </Card>

        </div>
      )}
    </div>
  );
}
