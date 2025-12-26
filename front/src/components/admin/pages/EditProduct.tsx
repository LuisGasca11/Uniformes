import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import VariantManager from "../components/VariantManager";
import ImageUploader from "../components/ImageUploader";
import Swal from "sweetalert2";

export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct({
          ...data,
          images: data.images ?? [],
          variants: data.variants ?? [],
        });
      });
  }, [id]);

  const save = async () => {
    const clean = {
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      sold_info: product.sold_info ?? "",
      category_id: product.category_id || null,
      brand: product.brand ?? "",
    };


    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clean),
    });

    if (!res.ok) {
      const error = await res.json();
      Swal.fire({
        title: "Error al actualizar",
        text: error.error || "No se pudo actualizar el producto",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "Producto actualizado",
      text: "Los cambios fueron guardados correctamente.",
      icon: "success",
      confirmButtonColor: "#3085d6",
    });
  };

  const deleteProduct = async () => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const res = await fetch(`http://localhost:4000/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el producto",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "Producto eliminado",
      text: "El producto fue eliminado correctamente.",
      icon: "success",
      confirmButtonColor: "#3085d6",
    }).then(() => {
      window.location.href = "/admin/products";
    });
  };

  if (!product) return <div className="p-8 text-center">Cargando…</div>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto mt-10 p-4">
      {/* FORM */}
      <ProductForm
        product={product}
        setProduct={setProduct}
        onSubmit={save}
        onDelete={deleteProduct}
      />

      {/* IMAGE MANAGER */}
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-semibold mb-2 text-center">Imágenes del producto</h2>

        <ImageUploader
          productId={Number(id)}
          onUploaded={(img: any) => {
            Swal.fire({
              toast: true,
              icon: "success",
              title: "Imagen subida correctamente",
              position: "top-end",
              showConfirmButton: false,
              timer: 1500,
            });

            setProduct({
              ...product,
              images: [...product.images, img],
            });
          }}
        />

        <div className="grid grid-cols-4 gap-4 mt-4">
          {product.images.map((img: any) => (
            <div key={img.id} className="relative">
              <img
                src={`http://localhost:4000/uploads/${img.image_url}`}
                className="w-full h-32 object-cover rounded border"
                alt="Product"
              />

              <button
                onClick={async () => {
                  const confirm = await Swal.fire({
                    title: "¿Eliminar imagen?",
                    text: "Esta acción no se puede deshacer",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Sí, eliminar",
                  });

                  if (!confirm.isConfirmed) return;

                  const res = await fetch(
                    `http://localhost:4000/api/products/${id}/images/${img.id}`,
                    { method: "DELETE" }
                  );

                  if (!res.ok) {
                    Swal.fire({
                      title: "Error",
                      text: "No se pudo eliminar la imagen",
                      icon: "error",
                      confirmButtonColor: "#d33",
                    });
                    return;
                  }

                  Swal.fire({
                    toast: true,
                    icon: "success",
                    title: "Imagen eliminada",
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                  });

                  setProduct({
                    ...product,
                    images: product.images.filter((i: any) => i.id !== img.id),
                  });
                }}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VARIANTS */}
      <VariantManager
        product={product}
        setProduct={setProduct}
        productId={Number(id)}
      />
    </div>
  );
}