import { useEffect, useState } from "react";
import { Search, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("http://localhost:4000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    }
    loadCategories();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
        navigate(`/buscar?q=${searchQuery.trim()}`);
        setSearchQuery("");
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-40"> 
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          
          <Share2 className="w-5 h-5 text-sky-400 shrink-0" /> 

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/categoria/${c.id}`)}
              className="
                text-base font-semibold text-gray-700 
                px-3 py-1 rounded-full 
                hover:bg-indigo-50 hover:text-sky-600 
                transition-all duration-200 shrink-0
              "
            >
              {c.name.toUpperCase()}
            </button>
          ))}

          <div className="ml-auto relative hidden md:block shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Busca entre todos los artículos"
              className="
                pl-10 pr-4 py-2 
                border-2 border-gray-300 rounded-full 
                w-72 text-sm 
                focus:border-sky-400 focus:ring-1 focus:ring-sky-400 
                transition-all outline-none
              "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default CategoryMenu;