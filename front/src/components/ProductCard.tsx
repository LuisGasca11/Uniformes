import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/CartProvider";
import { useWishlist } from "@/hooks/WishlistProvider";
import type { Product } from "../types/product";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { items: wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [currentImg] = useState(0);

  const variants = product.variants ?? [];
  const isInWishlist = wishlist.some((w) => w.product_id === product.id);

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

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const addQuick = (e: React.MouseEvent) => {
    e.stopPropagation();

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
  };

  const visibleColors = colorOptions.slice(0, 5);
  const extraColors = colorOptions.length - 5;

  return (
    <div
      className="
        group border border-gray-100 rounded-xl sm:rounded-2xl bg-white 
        hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer 
        p-4 sm:p-6 flex flex-col min-h-80 sm:min-h-[380px] md:min-h-[420px]
      "
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      {/* Header con corazón */}
      <div className="flex justify-end mb-1 sm:mb-2">
        <button
          onClick={toggleWishlist}
          className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isInWishlist 
                ? "fill-red-500 text-red-500" 
                : "text-gray-300 hover:text-gray-400"
            }`}
          />
        </button>
      </div>

      {/* Imagen */}
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-lg sm:rounded-xl mb-2 sm:mb-4">
        <img
          src={getImg() ?? "/products/default.jpg"}
          alt={product.name}
          className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Contenido centrado estilo Apple */}
      <div className="flex flex-col items-center text-center flex-1">
        {/* Nombre del producto */}
        <h3 className="text-[13px] sm:text-[15px] text-gray-900 font-medium line-clamp-2 mb-2 sm:mb-3">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-0.5 sm:gap-1 mb-3 sm:mb-4">
          <span className="text-xs sm:text-sm text-gray-500">$</span>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">
            {formatNumber(product.price)}
          </span>
        </div>

        {/* Puntitos de colores */}
        {colorOptions.length > 0 && (
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {visibleColors.map((color, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: color.color_hex }}
                title={color.color_name}
              />
            ))}
            {extraColors > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-400 ml-0.5 sm:ml-1">+{extraColors}</span>
            )}
          </div>
        )}

        {/* Spacer para empujar el botón al fondo */}
        <div className="flex-1" />

        {/* Botón de añadir */}
        <button
          onClick={addQuick}
          className="
            w-full py-2 sm:py-2.5 bg-[#009be9] hover:bg-[#0089d0] text-white 
            rounded-full text-xs sm:text-sm font-medium 
            transition-all active:scale-[0.97]
          "
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}