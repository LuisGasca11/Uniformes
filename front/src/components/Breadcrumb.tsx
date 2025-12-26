import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Breadcrumb() {
  const location = useLocation();
  const [category, setCategory] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);

    setCategory(null);
    setCategorySlug(null);
    setProductName(null);


    if (parts[0] === "categoria" && parts[1]) {
      const slug = parts[1];
      setCategorySlug(slug);

      fetch(`http://localhost:4000/api/categories/${slug}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data) setCategory(data.name);
        })
        .catch(() => {});
    }


    if (parts[0] === "producto" && parts[1]) {
      const id = parts[1];

      fetch(`http://localhost:4000/api/products/${id}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (!data) return;

          setProductName(data.name);

          if (data.category_name && data.category_slug) {
            setCategory(data.category_name);
            setCategorySlug(data.category_slug);
          } else {
            setCategory("Tienda");
            setCategorySlug("tienda");
          }
        })
        .catch(() => {});
    }
  }, [location.pathname]);

  return (
    <nav
      className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        <li>
          <Link to="/" className="hover:text-black font-medium">
            FYTTSA
          </Link>
        </li>

        {category && categorySlug && (
          <>
            <span>›</span>
            <li>
              <Link
                to={
                  categorySlug === "tienda"
                    ? "/tienda"
                    : `/categoria/${categorySlug}`
                }
                className="hover:text-black capitalize"
              >
                {category}
              </Link>
            </li>
          </>
        )}

        {productName && (
          <>
            <span>›</span>
            <li className="font-semibold text-gray-900">
              {productName}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
