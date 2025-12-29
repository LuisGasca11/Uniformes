import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* 404 Grande */}
        <h1 className="text-[150px] sm:text-[200px] font-black text-gray-200 leading-none select-none">
          404
        </h1>
        
        {/* Mensaje */}
        <div className="-mt-8 sm:-mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-500 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#009be9] hover:bg-[#0088cc] text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-500/25"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>
          
          <Link
            to="/uniformes"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition border border-gray-200"
          >
            <Search className="w-5 h-5" />
            Ver productos
          </Link>
        </div>

        {/* Volver atrás */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver atrás
        </button>
      </div>
    </div>
  );
}
