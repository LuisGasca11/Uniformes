import { useState, useRef, type MouseEvent } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom = ({ src, alt, className = "" }: ImageZoomProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_LEVEL = 2.5;
  const LENS_SIZE = 120;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Posición del lente (centrado en el cursor, limitado al contenedor)
    const halfLens = LENS_SIZE / 2;
    const lensX = Math.max(0, Math.min(x - halfLens, rect.width - LENS_SIZE));
    const lensY = Math.max(0, Math.min(y - halfLens, rect.height - LENS_SIZE));
    setLensPosition({ x: lensX, y: lensY });

    // Calcular el centro del lente para el zoom (sincronizado)
    const lensCenterX = lensX + halfLens;
    const lensCenterY = lensY + halfLens;
    
    const percentX = (lensCenterX / rect.width) * 100;
    const percentY = (lensCenterY / rect.height) * 100;
    setZoomPosition({ x: percentX, y: percentY });
  };

  return (
    <div className="relative">
      {/* Imagen principal */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-crosshair ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Cuadrado/Lente */}
        {showZoom && (
          <div
            className="absolute border-2 border-[#009be9] bg-[#009be9]/10 pointer-events-none rounded-sm"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPosition.x,
              top: lensPosition.y,
            }}
          />
        )}
      </div>

      {/* Ventana de zoom - MÁS GRANDE */}
      {showZoom && (
        <div
          className="absolute left-[calc(100%+0.75rem)] top-0 w-[600px] h-[600px] border-2 border-gray-300 rounded-xl overflow-hidden shadow-2xl bg-white z-50 hidden lg:block"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${ZOOM_LEVEL * 100}%`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;
