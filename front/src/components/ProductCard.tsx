import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/hooks/CartProvider";
import type { Product } from "../types/product";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [currentImg] = useState(0);

  const variants = product.variants ?? [];

  const getImg = () => {
    const img = product.images?.[currentImg];
    return img ? `http://localhost:4000/uploads/${img.image_url}` : null;
  };

  const colorOptions = Array.from(
    new Map(
      variants.map((v) => [
        v.color_hex,
        { color_hex: v.color_hex, color_name: v.color_name },
      ])
    ).values()
  );

  const getGenderOptions = (colorHex: string) => {
    return Array.from(
      new Set(
        variants
          .filter((v) => v.color_hex === colorHex)
          .map((v) => v.gender || "unisex")
      )
    );
  };

  const getSizesList = (colorHex: string, gender: string) => {
    return variants
      .filter((v) => v.color_hex === colorHex && v.gender === gender)
      .map((v) => ({
        size: v.size,
        stock: v.stock,
      }));
  };

  const getVariant = (colorHex: string, size: string, gender: string) => {
    return variants.find(
      (v) =>
        v.color_hex === colorHex &&
        v.size === size &&
        v.gender === gender &&
        v.stock > 0
    );
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-MX").format(num);
  };

  const addQuick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se active el onClick del card

    if (!variants.length) return toast.error("Este producto no tiene variantes configuradas.");

    const defaultColor = colorOptions[0]?.color_hex;
    if (!defaultColor) return toast.error("Producto sin colores disponibles");

    const genders = getGenderOptions(defaultColor);
    const defaultGender = genders[0];
    if (!defaultGender) return toast.error("Producto sin géneros disponibles");

    const sizeList = getSizesList(defaultColor, defaultGender);
    const available = sizeList.find((s) => s.stock > 0);

    if (!available) return toast.error("No hay tallas disponibles");

    const variant = getVariant(defaultColor, available.size, defaultGender);
    if (!variant) return toast.error("Sin stock disponible");

    addToCart(product.id, variant.id, 1);
    toast.success("Producto agregado al carrito");
  };

  return (
    <div
      className="
        group border border-gray-200 rounded-lg bg-white shadow-sm 
        hover:shadow-md transition-all duration-300 cursor-pointer 
        w-[280px] p-4 flex flex-col
      "
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      <div className="w-full h-56 flex items-center justify-center bg-gray-200 overflow-hidden rounded-lg">
        <img
          src={getImg() ?? "/products/default.jpg"}
          alt={product.name}
          className="object-contain h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-3 text-[15px] text-gray-900 font-medium line-clamp-2 text-left">
        {product.name}
      </h3>

      <div className="mt-2 text-left flex items-start gap-1">
        <span className="text-[13px] text-gray-600 font-semibold">MXN $</span>
        <span className="text-2xl text-black leading-none">
          {formatNumber(product.price)}
        </span>
      </div>

      <button
        onClick={addQuick}
        className="
          mt-4 w-full py-2 bg-white hover:bg-gray-100 text-gray-900 
          rounded-full text-sm font-medium border border-black 
          transition active:scale-[0.97]
        "
      >
        Añadir al carrito
      </button>
    </div>
  );
}