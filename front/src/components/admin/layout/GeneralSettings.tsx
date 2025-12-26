export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración General</h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-4 border">
        <div>
          <label className="font-medium">Nombre del sitio</label>
          <input className="border p-2 rounded w-full" placeholder="Mi Tienda" />
        </div>

        <div>
          <label className="font-medium">Logo</label>
          <input type="file" className="border p-2 rounded w-full" />
        </div>

        <div>
          <label className="font-medium">Modo mantenimiento</label>
          <input type="checkbox" className="ml-2" />
        </div>
      </div>
    </div>
  );
}
