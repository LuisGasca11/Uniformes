import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
}

const CategoryCard = ({ category }: { category: Category }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/categoria/${category.id}`)}
      className="
        p-0.5 cursor-pointer rounded-sm overflow-hidden shadow-lg 
        hover:shadow-2xl hover:scale-[1.01] transition-all duration-300
        bg-linear-to-r from-sky-400 to-indigo-900
      "
      role="link"
      tabIndex={0}
      aria-label={`Ver categoría: ${category.name}`}
    >
        <div className="bg-white rounded-[10px] h-full flex items-stretch  sm:h-48 lg:h-56">
            
            {/* IMAGEN */}
            <div className="w-1/3 min-w-[120px] shrink-0 bg-gray-50 overflow-hidden p-3 md:p-4">
              <img
                src={
                  category.image_url
                    ? `http://localhost:4000/uploads/categories/${category.image_url}`
                    : "/categories/default.jpg"
                }
                alt={category.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* INFORMACIÓN */}
            <div className="p-4 sm:p-5 flex flex-col justify-center w-2/3 grow">
              <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition tracking-tight leading-snug">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
        </div>
    </div>
  );
};

export default CategoryCard;