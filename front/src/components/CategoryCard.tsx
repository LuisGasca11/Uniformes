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
        group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-lg 
        hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
        border border-gray-100 hover:border-[#009be9]
      "
      role="link"
      tabIndex={0}
      aria-label={`Ver categoría: ${category.name}`}
    >
      {/* IMAGEN */}
      <div className="relative h-56 overflow-hidden flex items-center justify-center p-8" style={{background: 'linear-gradient(to bottom right, #e6f4fb, #, #)'}}>
        {/* Overlay sutil al hacer hover */}
        <div className="absolute inset-0 transition-all duration-300" style={{backgroundColor: 'rgba(0, 155, 233, 0)'}}></div>
        <style>{`
          .group:hover .absolute.inset-0 {
            background-color: rgba(0, 155, 233, 0.05) !important;
          }
        `}</style>
        
        {category.image_url ? (
          <img
            src={`http://localhost:4000/uploads/categories/${category.image_url}`}
            alt={category.name}
            className="max-w-full max-h-full object-contain transform transition-all duration-300 group-hover:scale-105 relative z-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl font-bold" style="color: #009be9">${category.name.charAt(0).toUpperCase()}</div>`;
            }}
          />
        ) : (
          <div className="text-6xl font-bold transform transition-all duration-300 group-hover:scale-105" style={{color: '#009be9'}}>
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg" style={{background: 'linear-gradient(to right, #009be9, #253040)'}}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="p-5 bg-white relative">
        <h3 className="text-xl font-bold text-gray-900 transition-colors duration-200 mb-2 group-hover:text-[#009be9]">
          {category.name}
        </h3>
        {category.description ? (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Explora esta categoría
          </p>
        )}
        
        {/* Indicador sutil */}
        <div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{color: '#009be9'}}>
          <span>Ver productos</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;