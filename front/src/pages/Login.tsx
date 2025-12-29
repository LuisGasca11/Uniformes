import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

interface LoginProps {
  isModal?: boolean;
}

export default function Login({ isModal = false }: LoginProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Credenciales incorrectas");
        return;
      }

      login(data.token, data.user);
      toast.success("¡Bienvenido de nuevo!");
      
      // Disparar evento para cerrar el modal si está en modal
      if (isModal) {
        window.dispatchEvent(new CustomEvent("login-success"));
      }
      
      // Redirigir a admin si es admin, sino a home
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (!isModal) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Iniciar sesión
      </h2>
      <p className="text-gray-500 text-center mb-6">
        Ingresa a tu cuenta para continuar
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009be9] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password - solo visible en página completa, no en modal */}
        {!isModal && (
          <div className="text-right">
            <Link to="/recuperar-contrasena" className="text-sm text-[#009be9] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#009be9] hover:bg-[#0089d0] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Ingresar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">¿No tienes cuenta?</span>
        </div>
      </div>

      {/* Register Link */}
      <Link
        to="/registro"
        onClick={() => {
          if (isModal) {
            window.dispatchEvent(new CustomEvent("login-success")); // Cierra el modal
          }
        }}
        className="block w-full text-center py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition"
      >
        Crear cuenta nueva
      </Link>

      {/* Link para olvidar contraseña en modal */}
      {isModal && (
        <Link
          to="/recuperar-contrasena"
          onClick={() => window.dispatchEvent(new CustomEvent("login-success"))}
          className="block text-center text-sm text-gray-500 hover:text-[#009be9] mt-4 transition"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      )}
    </>
  );

  // Si es modal, solo retorna el contenido
  if (isModal) {
    return content;
  }

  // Si es página completa, retorna con el contenedor
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img 
              src="/fyttsaico.png" 
              alt="FYTTSA" 
              className="h-40 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {content}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 FYTTSA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
