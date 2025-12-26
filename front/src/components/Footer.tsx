import React from "react";

interface FooterProps {
  className?: string;
  logoSuperior?: string;
  logoInferior?: string;
  showSocialMedia?: boolean;
  showContactLinks?: boolean;
  showPartnerLinks?: boolean;
  showLearnMoreLinks?: boolean;
  showPrivacyNotice?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  className = "",
  logoSuperior = "/pobs.png",
  logoInferior = "/fyttwh.png",
  showSocialMedia = true,
  showPartnerLinks = true,
  showLearnMoreLinks = true,
  showPrivacyNotice = true,
}) => {

  return (
    <footer
      className={`w-full bg-amazon-dark-gray text-white pt-12 md:pt-16 pb-8 md:pb-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_1.2fr_1fr] gap-10 md:gap-12">

          <div className="flex flex-col items-center sm:items-start gap-6 opacity-0 animate-fade-up">
            <img
              src={logoSuperior}
              alt="Logo superior"
              className="h-10 sm:h-12 transition-all duration-300 hover:scale-105"
            />

            <div className="w-24 h-0.5 bg-sky-400 rounded-full" />
          </div>

          <div
            className="flex flex-col items-center opacity-0 animate-fade-up order-3 sm:order-2 col-span-1 sm:col-span-2 md:col-span-1"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex flex-col gap-3 items-center text-center w-full">

              {showPartnerLinks && (
                <a
                  href="/Form"
                  className="text-white text-sm hover:text-sky-400 transition-all duration-200"
                >
                  Contáctanos
                </a>
              )}

              {showPartnerLinks && (
                <a
                  href="https://club.mosip.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-sky-400 transition-all duration-200"
                >
                  yfutf
                </a>
              )}

              {showLearnMoreLinks && (
                <a
                  href="/MicroPage"
                  className="text-white text-sm hover:text-sky-400 transition-all duration-200"
                >
                  tdyd
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end order-2 sm:order-3 gap-3">
            <img
              src={logoInferior}
              alt="Logo inferior"
              className="h-14 sm:h-16 transition-all duration-300 hover:scale-105"
            />

            {showSocialMedia && (
              <div
                className="flex flex-col items-center sm:items-end opacity-0 animate-fade-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="mt-1 w-20 h-0.5 bg-sky-400 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* 

        */}
        <div
          className="relative my-8 md:my-12 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="h-0.5 bg-[#232F3E]" />
        </div>

        {showPrivacyNotice && (
          <div
            className="text-center text-xs sm:text-sm opacity-0 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="text-white leading-relaxed">
              © 2026 Black Sheep® |{" "}
              <a
                href="/avisoPrivacidad"
                className="hover:text-sky-400 transition-all duration-200 mx-1"
              >
                Aviso de Privacidad
              </a>{" "}
              |{" "}
              <a
                href="/terminosCondiciones"
                className="hover:text-sky-400 transition-all duration-200 mx-1"
              >
                Términos y Condiciones
              </a>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
