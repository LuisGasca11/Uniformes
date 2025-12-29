import { useState } from "react";
import { Shield, FileText, Truck, RotateCcw, CreditCard } from "lucide-react";

type TabType = "privacidad" | "terminos" | "envios" | "devoluciones" | "pagos";

export default function Politicas() {
  const [activeTab, setActiveTab] = useState<TabType>("privacidad");

  const tabs = [
    { id: "privacidad" as TabType, label: "Privacidad", icon: Shield },
    { id: "terminos" as TabType, label: "Términos", icon: FileText },
    { id: "envios" as TabType, label: "Envíos", icon: Truck },
    { id: "devoluciones" as TabType, label: "Devoluciones", icon: RotateCcw },
    { id: "pagos" as TabType, label: "Pagos", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Políticas</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Información importante sobre nuestros términos, privacidad y servicios.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#009be9] text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {activeTab === "privacidad" && <PrivacidadContent />}
          {activeTab === "terminos" && <TerminosContent />}
          {activeTab === "envios" && <EnviosContent />}
          {activeTab === "devoluciones" && <DevolucionesContent />}
          {activeTab === "pagos" && <PagosContent />}
        </div>

        {/* Última actualización */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Última actualización: Diciembre 2025
        </p>
      </div>
    </div>
  );
}

function PrivacidadContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Shield className="w-6 h-6 text-[#009be9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 m-0">Política de Privacidad</h2>
      </div>

      <p className="text-gray-600 leading-relaxed">
        En FYTTSA, nos comprometemos a proteger tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Información que recopilamos</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Información de registro: nombre, correo electrónico, teléfono</li>
        <li>Información de envío: dirección completa</li>
        <li>Información de pago: procesada de forma segura por terceros</li>
        <li>Historial de compras y preferencias</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Uso de la información</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Procesar y entregar tus pedidos</li>
        <li>Enviarte actualizaciones sobre tus compras</li>
        <li>Mejorar nuestros productos y servicios</li>
        <li>Enviarte promociones (solo si lo autorizas)</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Protección de datos</h3>
      <p className="text-gray-600 leading-relaxed">
        Utilizamos medidas de seguridad estándar de la industria para proteger tu información, incluyendo encriptación SSL para todas las transacciones.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Tus derechos</h3>
      <p className="text-gray-600 leading-relaxed">
        Conforme a la Ley Federal de Protección de Datos Personales (LFPDPPP), tienes derecho a acceder, rectificar, cancelar u oponerte al uso de tus datos personales.
      </p>
    </div>
  );
}

function TerminosContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <FileText className="w-6 h-6 text-[#009be9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 m-0">Términos y Condiciones</h2>
      </div>

      <p className="text-gray-600 leading-relaxed">
        Al utilizar nuestro sitio web y realizar compras, aceptas los siguientes términos y condiciones.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Uso del sitio</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Debes tener al menos 18 años o contar con autorización de un tutor</li>
        <li>La información proporcionada debe ser veraz y actualizada</li>
        <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Productos y precios</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Los precios están en pesos mexicanos (MXN) e incluyen IVA</li>
        <li>Nos reservamos el derecho de modificar precios sin previo aviso</li>
        <li>Las imágenes son representativas, pueden variar ligeramente</li>
        <li>La disponibilidad está sujeta a existencias</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Compras</h3>
      <p className="text-gray-600 leading-relaxed">
        Al realizar una compra, recibirás un correo de confirmación. Nos reservamos el derecho de cancelar pedidos en casos de error en precios o disponibilidad.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Propiedad intelectual</h3>
      <p className="text-gray-600 leading-relaxed">
        Todo el contenido del sitio (imágenes, textos, logos) es propiedad de FYTTSA y está protegido por derechos de autor.
      </p>
    </div>
  );
}

function EnviosContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Truck className="w-6 h-6 text-[#009be9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 m-0">Política de Envíos</h2>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Tiempos de entrega</h3>
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <table className="w-full text-gray-600">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3 font-medium">Zona Metropolitana</td>
              <td className="py-3 text-right">2-3 días hábiles</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3 font-medium">Interior de la República</td>
              <td className="py-3 text-right">3-5 días hábiles</td>
            </tr>
            <tr>
              <td className="py-3 font-medium">Zonas extendidas</td>
              <td className="py-3 text-right">5-7 días hábiles</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Costos de envío</h3>
      <ul className="text-gray-600 space-y-2">
        <li><strong>Envío gratis</strong> en compras mayores a $999 MXN</li>
        <li>Envío estándar: $99 MXN</li>
        <li>Envío express: $149 MXN (entrega al día siguiente en CDMX)</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Seguimiento</h3>
      <p className="text-gray-600 leading-relaxed">
        Una vez que tu pedido sea enviado, recibirás un correo con el número de guía para rastrear tu paquete.
      </p>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Importante</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Los tiempos pueden variar en temporadas altas</li>
        <li>Asegúrate de proporcionar una dirección correcta y completa</li>
        <li>Se requiere firma al momento de la entrega</li>
      </ul>
    </div>
  );
}

function DevolucionesContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <RotateCcw className="w-6 h-6 text-[#009be9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 m-0">Política de Devoluciones</h2>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <p className="text-green-800 font-medium m-0">
          ✓ Tienes 30 días para realizar cambios o devoluciones
        </p>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Condiciones</h3>
      <ul className="text-gray-600 space-y-2">
        <li>El producto debe estar sin uso y con etiquetas originales</li>
        <li>Debe incluir el empaque original en buen estado</li>
        <li>Debes presentar tu comprobante de compra</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Proceso de devolución</h3>
      <ol className="text-gray-600 space-y-3">
        <li><strong>1.</strong> Contacta a nuestro equipo por email o WhatsApp</li>
        <li><strong>2.</strong> Te enviaremos una guía de devolución prepagada</li>
        <li><strong>3.</strong> Empaca el producto de forma segura</li>
        <li><strong>4.</strong> Envía el paquete con la guía proporcionada</li>
        <li><strong>5.</strong> Una vez recibido, procesamos tu reembolso en 5-7 días hábiles</li>
      </ol>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Excepciones</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Productos personalizados o bordados</li>
        <li>Ropa interior y calcetines (por higiene)</li>
        <li>Productos en oferta o liquidación</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Cambios de talla</h3>
      <p className="text-gray-600 leading-relaxed">
        Si necesitas cambiar la talla, el primer cambio es gratuito. Solo paga el envío del nuevo producto.
      </p>
    </div>
  );
}

function PagosContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <CreditCard className="w-6 h-6 text-[#009be9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 m-0">Métodos de Pago</h2>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Aceptamos</h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-bold text-gray-900 mb-2">💳 Tarjetas</h4>
          <ul className="text-gray-600 text-sm space-y-1 m-0">
            <li>Visa, Mastercard, American Express</li>
            <li>Tarjetas de débito y crédito</li>
            <li>Meses sin intereses disponibles</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-bold text-gray-900 mb-2">🏪 Efectivo</h4>
          <ul className="text-gray-600 text-sm space-y-1 m-0">
            <li>OXXO Pay</li>
            <li>Depósito bancario</li>
            <li>Transferencia SPEI</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Seguridad</h3>
      <ul className="text-gray-600 space-y-2">
        <li>Todas las transacciones están protegidas con encriptación SSL</li>
        <li>No almacenamos datos de tarjetas en nuestros servidores</li>
        <li>Procesamos pagos a través de plataformas certificadas PCI DSS</li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Meses sin intereses</h3>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 m-0">
          <strong>3, 6 y 12 meses sin intereses</strong> disponibles con tarjetas participantes en compras mayores a $1,500 MXN
        </p>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Facturación</h3>
      <p className="text-gray-600 leading-relaxed">
        Emitimos facturas electrónicas (CFDI). Solicita tu factura dentro de los 7 días posteriores a tu compra proporcionando tus datos fiscales.
      </p>
    </div>
  );
}
