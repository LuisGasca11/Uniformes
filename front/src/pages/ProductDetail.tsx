import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ShoppingCart,
    Package,
    Shield,
    Truck,
    Minus, 
    Plus, 
    Zap, 
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/CartProvider";
import type { Product } from "../types/product";

const STOCK_REFRESH_MS = 5000;

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchProduct = async (silent = false) => {
        try {
            const res = await fetch(`http://localhost:4000/api/products/${id}`);
            if (!res.ok) throw new Error("Producto no encontrado");

            const data = await res.json();

            setProduct((prev) => {
                if (!prev) {
                    if (data.variants && data.variants.length > 0 && !selectedVariantId) {
                        setSelectedVariantId(data.variants[0].id);
                    }
                    return data;
                }

                if (selectedVariantId) {
                    const oldVariant = prev.variants?.find(
                        (v) => v.id === selectedVariantId
                    );
                    const newVariant = data.variants?.find(
                        (v: any) => v.id === selectedVariantId
                    );

                    if (
                        oldVariant &&
                        newVariant &&
                        oldVariant.stock !== newVariant.stock
                    ) {
                        toast.info("Stock actualizado en tiempo real.", {
                            icon: <Zap className="w-4 h-4 text-blue-500" />,
                        });
                    }
                }

                return data;
            });
        } catch (err) {
            console.error(err);
            if (!silent) {
                toast.error("Error al cargar el producto");
                navigate("/");
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [id]);

    useEffect(() => {
        if (!selectedVariantId) return;

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            fetchProduct(true);
        }, STOCK_REFRESH_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [selectedVariantId]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 bg-gray-50">
                Cargando producto…
            </div>
        );

    if (!product) return null;

    const variants = product.variants ?? [];
    const images = product.images ?? [];

    const selectedVariant =
        variants.find((v) => v.id === selectedVariantId) ?? null;

    const getCurrentImage = () => {
        if (!images.length) return "/products/default.jpg";
        return `http://localhost:4000/uploads/${images[currentImageIndex].image_url}`;
    };

    const formatNumber = (num: number) =>
        new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2,
        }).format(num);

    const formatStock = (num: number) => 
        new Intl.NumberFormat("es-MX", {
            maximumFractionDigits: 0,
        }).format(num);


    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error("Por favor, selecciona una variante (talla, color, etc.).");
            return;
        }

        await fetchProduct(true);

        const freshVariant =
            product?.variants?.find((v) => v.id === selectedVariant.id) ?? null;

        if (!freshVariant || freshVariant.stock <= 0) {
            toast.error("Esta variante se agotó. Por favor, actualiza la página.", {
                icon: <Zap className="w-4 h-4 text-red-500" />,
            });
            return;
        }

        if (quantity > freshVariant.stock) {
            toast.error(`Solo hay ${freshVariant.stock} unidades disponibles.`, {
                icon: <Zap className="w-4 h-4 text-red-500" />,
            });
            setQuantity(freshVariant.stock); 
            return;
        }

        addToCart(product.id, freshVariant.id, quantity);
        toast.success(
            <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Producto agregado al carrito.
            </div>
        );
    };

    const isAddToCartDisabled = !selectedVariant || selectedVariant.stock <= 0;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition duration-200 font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Volver al catálogo
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <img
                                src={getCurrentImage()}
                                alt={product.name}
                                className="w-full h-full object-contain transition-opacity duration-300 hover:scale-[1.03]"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`
                                            shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-3 rounded-lg overflow-hidden transition-all duration-300 shadow-md
                                            ${currentImageIndex === i
                                                ? "border-4 border-blue-600 ring-2 ring-blue-300 scale-105"
                                                : "border-2 border-gray-300 hover:border-gray-400"
                                            }
                                        `}
                                    >
                                        <img
                                            src={`http://localhost:4000/uploads/${img.image_url}`}
                                            alt={`Thumbnail ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* BRAND / CODE / KEY */}
                        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                            <div className="flex flex-wrap items-center gap-4">
                                {product.brand && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-gray-500">
                                            Marca
                                        </span>
                                        <div className="text-lg font-extrabold text-orange-600">
                                            {product.brand}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col border-l pl-4">
                                    <span className="text-xs font-semibold uppercase text-gray-500">
                                        Código
                                    </span>
                                    <div className="font-mono font-bold text-gray-800">
                                        {selectedVariant?.code ?? "—"}
                                    </div>
                                </div>

                                <div className="flex flex-col border-l pl-4">
                                    <span className="text-xs font-semibold uppercase text-gray-500">
                                        Clave
                                    </span>
                                    <div className="font-mono font-bold text-gray-800">
                                        {selectedVariant?.key_code ?? "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-extrabold text-gray-900 leading-snug">
                            {product.name}
                        </h1>

                        {/* PRICE */}
                        <div className="text-5xl font-bold text-blue-600 py-4 border-y border-gray-200">
                            {formatNumber(product.price)}
                        </div>

                        {product.description && (
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        )}

                        <div>
                            <label htmlFor="variant-select" className="font-semibold mb-3 block text-gray-800">
                                Selecciona una variante <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="variant-select"
                                value={selectedVariantId ?? ""}
                                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                                className="w-full border-2 border-gray-300 rounded-xl px-5 py-3 text-lg text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 appearance-none"
                            >
                                <option value="" disabled>
                                    Selecciona talla / género / color
                                </option>
                                {variants.map((v) => (
                                    <option
                                        key={v.id}
                                        value={v.id}
                                        disabled={v.stock <= 0}
                                        className={v.stock <= 0 ? "text-red-500 bg-gray-100" : "text-gray-900"}
                                    >
                                        {v.size} ·{" "}
                                        {v.gender === "male"
                                            ? "Hombre"
                                            : v.gender === "female"
                                                ? "Mujer"
                                                : "Unisex"}{" "}
                                        · {v.color_name}
                                        {v.stock <= 0 ? " — ¡Agotado!" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* STOCK */}
                        {selectedVariant && (
                            <div className={`p-4 rounded-xl border-l-4 ${selectedVariant.stock > 0 ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}>
                                <b className="text-gray-800">Disponibilidad:</b>{" "}
                                <span className={`font-bold text-lg ${selectedVariant.stock > 0 ? "text-green-700" : "text-red-700"}`}>
                                    {selectedVariant.stock > 0
                                        ? `${formatStock(selectedVariant.stock)} unidades`
                                        : "Producto agotado"}
                                </span>
                            </div>
                        )}

                        <div className="pt-4 space-y-4 sm:flex sm:items-center sm:gap-4 sm:space-y-0">
                            {/* QUANTITY */}
                            <div className="shrink-0">
                                <p className="font-semibold mb-2 text-gray-800">Cantidad</p>
                                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-150"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="w-16 text-center text-xl font-bold text-gray-900">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-150"
                                        disabled={!selectedVariant || quantity >= selectedVariant.stock}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grow">
                                <p className="invisible mb-2 text-gray-800">.</p> 
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddToCartDisabled}
                                    className={`w-full py-3 sm:py-4 rounded-xl font-extrabold text-lg flex justify-center gap-3 items-center transition-all duration-300 transform hover:scale-[1.01] shadow-lg
                                        ${!isAddToCartDisabled
                                            ? "bg-blue-600 text-white hover:bg-blue-700 ring-4 ring-blue-300/50"
                                            : "bg-gray-400 text-gray-600 cursor-not-allowed shadow-none"
                                        }
                                    `}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {isAddToCartDisabled ? "Agotado / Selecciona Variante" : "Añadir al carrito"}
                                </button>
                            </div>
                        </div>

                        {/* BENEFITS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200 text-sm font-medium text-gray-700">
                            <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                                <Truck className="w-6 h-6 text-blue-600 shrink-0" />
                                <div>
                                    <div className="font-bold text-gray-900">Envío Rápido</div>
                                    <p className="text-xs text-gray-600">En 24-48 horas.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                                <Shield className="w-6 h-6 text-green-600 shrink-0" />
                                <div>
                                    <div className="font-bold text-gray-900">Compra Segura</div>
                                    <p className="text-xs text-gray-600">Garantía de devolución.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                                <Package className="w-6 h-6 text-orange-600 shrink-0" />
                                <div>
                                    <div className="font-bold text-gray-900">Producto Original</div>
                                    <p className="text-xs text-gray-600">Directo del fabricante.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;