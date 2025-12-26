export default function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notificaciones</h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Ventas nuevas
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Productos sin stock
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Errores del sistema
        </label>
      </div>
    </div>
  );
}
