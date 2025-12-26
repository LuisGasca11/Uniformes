import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Form() {
  const [, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <section
        id="contact-section"
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* TÍTULO */}
          <div className="text-center animate-fade-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-[#232B34]">
              ¿Listo para transformar tu almacén?
            </h2>

            <p
              className="
              text-lg font-semibold mb-12 max-w-2xl mx-auto
              bg-linear-to-r from-[#00C8FF] to-slate-900
              text-transparent bg-clip-text
            "
            >
              Déjanos tus datos y un consultor te contactará para una demo
              personalizada
            </p>
          </div>

          {/* FORM CARD */}
          <div
            className="
              max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-xl
              border border-sky-400/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]
              transition-all duration-300 animate-fade-up
            "
            style={{ animationDelay: "0.15s" }}
          >
            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* INPUT */}
              <div
                className="space-y-2 animate-fade-in text-[#232B34]"
                style={{ animationDelay: "0.2s" }}
              >
                <label className="text-sm font-bold">NOMBRE</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="
                    w-full px-4 py-3 bg-white rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                    text-[#232B34] transition-all
                  "
                />
              </div>

              <div
                className="space-y-2 animate-fade-in text-[#232B34]"
                style={{ animationDelay: "0.3s" }}
              >
                <label className="text-sm font-bold">CORREO</label>
                <input
                  type="email"
                  placeholder="tu@empresa.com"
                  className="
                    w-full px-4 py-3 bg-white rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                    text-[#232B34] transition-all
                  "
                />
              </div>

              <div
                className="space-y-2 animate-fade-in text-[#232B34]"
                style={{ animationDelay: "0.4s" }}
              >
                <label className="text-sm font-bold">EMPRESA</label>
                <input
                  type="text"
                  placeholder="Nombre de tu empresa"
                  className="
                    w-full px-4 py-3 bg-white rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                    text-[#232B34] transition-all
                  "
                />
              </div>

              <div
                className="space-y-2 animate-fade-in text-[#232B34]"
                style={{ animationDelay: "0.5s" }}
              >
                <label className="text-sm font-bold">MÓVIL</label>
                <input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  className="
                    w-full px-4 py-3 bg-white rounded-lg border border-gray-300
                    focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                    text-[#232B34] transition-all
                  "
                />
              </div>
            </div>

            {/* TEXTAREA */}
            <div
              className="space-y-2 mb-6 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <label className="text-sm font-bold text-[#232B34]">
                ¿QUÉ TE INTERESA MÁS?
              </label>
              <textarea
                rows={3}
                placeholder="Cuéntanos..."
                className="
                  w-full px-4 py-3 bg-white rounded-lg border border-gray-300
                  focus:ring-2 focus:ring-sky-400 focus:border-sky-400
                  text-[#232B34] resize-none transition-all
                "
              />
            </div>

            <button
              className="
                w-full py-4 text-lg rounded-xl font-bold mb-4
                bg-linear-to-r from-sky-400 via-sky-500 to-sky-600
                text-white shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]
                hover:scale-[1.02] active:scale-[0.98]
                transition-all flex items-center justify-center gap-2
              "
            >
              Solicitar Demo Gratuita
              <ArrowRight className="h-5 w-5" />
            </button>

            <p
              className="text-sm text-center text-gray-600 animate-fade-in"
              style={{ animationDelay: "0.7s" }}
            >
              Al enviar este formulario, aceptas ser contactado por un
              especialista de black_sheep®.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10 mt-12 font-bold text-[#232B34]">
            <div
              className="flex items-center gap-2 animate-fade-up"
              style={{ animationDelay: "0.8s" }}
            >
              <CheckCircle className="h-5 w-5 text-sky-400" />
              Demo en 15 minutos
            </div>

            <div
              className="flex items-center gap-2 animate-fade-up"
              style={{ animationDelay: "1s" }}
            >
              <Shield className="h-5 w-5 text-sky-400" />
              Sin compromiso
            </div>

            <div
              className="flex items-center gap-2 animate-fade-up"
              style={{ animationDelay: "1.2s" }}
            >
              <Zap className="h-5 w-5 text-sky-400" />
              Respuesta en 24h
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
