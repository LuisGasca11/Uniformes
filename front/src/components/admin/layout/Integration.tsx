export default function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Integraciones</h1>

      <div className="bg-white p-6 rounded-xl border shadow space-y-4">
        <div>
          <label>Stripe API Key</label>
          <input className="border p-2 rounded w-full" />
        </div>

        <div>
          <label>Correo SMTP</label>
          <input className="border p-2 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
