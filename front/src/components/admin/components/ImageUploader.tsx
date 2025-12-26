import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UploadCloud, ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import clsx from "clsx";

interface UploadedImage {
  id: number | null;
  image_url: string;
}

export default function ImageUploader({
  productId,
  onUploaded,
}: {
  productId: number;
  onUploaded: (img: UploadedImage) => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }, []);

  async function upload() {
    if (!file) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `http://localhost:4000/api/products/${productId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      onUploaded({
        id: data.id ?? null,
        image_url: data.filename,
      });

      toast.success("Imagen subida correctamente");

      setOpen(false);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir la imagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
      >
        <UploadCloud className="mr-2 w-4 h-4" />
        Subir Imagen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Agregar nueva imagen
            </DialogTitle>
            <DialogDescription>
              Arrastra una imagen aquí o selecciónala desde tu computadora.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 items-center">

            <div
              className={clsx(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition w-full",
                isDragging
                  ? "border-blue-600 bg-blue-50/50"
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/30"
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <ImageIcon
                className={clsx(
                  "w-12 h-12 transition",
                  isDragging ? "text-blue-600 scale-110" : "text-gray-500"
                )}
              />

              <span className="text-gray-700 font-medium text-center">
                {isDragging
                  ? "Suelta la imagen aquí"
                  : "Haz clic o arrastra una imagen"}
              </span>

              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {preview && (
              <div className="relative rounded-xl overflow-hidden border shadow-md group w-full">
                <img
                  src={preview}
                  className="w-full h-64 object-contain transition-transform group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm shadow">
                  Vista previa
                </span>
              </div>
            )}

            <Button
              onClick={upload}
              disabled={loading}
              className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Subir Imagen"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
