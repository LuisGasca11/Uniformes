import nodemailer from "nodemailer";

// Configurar transporter con Gmail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Error configurando email:", error.message);
  } else {
    console.log("✅ Servidor de email listo");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"FYTTSA Uniformes" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email enviado a ${options.to}`);
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
};

// Templates de email
export const emailTemplates = {
  // Email de recuperación de contraseña
  resetPassword: (resetLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #009be9 0%, #0077b6 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">FYTTSA</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Uniformes Escolares</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px; font-size: 22px;">Restablecer contraseña</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
                    Haz clic en el botón de abajo para crear una nueva contraseña.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetLink}" style="background-color: #009be9; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                          Restablecer contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    Si no solicitaste este cambio, puedes ignorar este correo. El enlace expira en 1 hora.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <a href="${resetLink}" style="color: #009be9; word-break: break-all;">${resetLink}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 FYTTSA. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Email de bienvenida
  welcome: (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #009be9 0%, #0077b6 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Bienvenido a FYTTSA!</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px;">Hola ${name} 👋</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
                    Tu cuenta ha sido creada exitosamente. Ahora puedes disfrutar de todos los beneficios:
                  </p>
                  <ul style="color: #666; line-height: 2; padding-left: 20px;">
                    <li>🛒 Compra uniformes de alta calidad</li>
                    <li>❤️ Guarda tus productos favoritos</li>
                    <li>📦 Rastrea tus pedidos fácilmente</li>
                    <li>🏠 Guarda múltiples direcciones de envío</li>
                  </ul>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="http://localhost:5173/uniformes" style="background-color: #009be9; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; display: inline-block;">
                          Ver productos
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 FYTTSA. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Email de confirmación de pedido
  orderConfirmation: (orderId: number, items: any[], total: number, address: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ ¡Pedido confirmado!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">Pedido #${orderId}</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px;">
                    Gracias por tu compra. Tu pedido ha sido recibido y está siendo procesado.
                  </p>
                  
                  <!-- Productos -->
                  <h3 style="color: #333; margin: 20px 0 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Productos</h3>
                  ${items.map(item => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #eee; margin-bottom: 10px;">
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <p style="margin: 0; color: #333; font-weight: 500;">${item.name}</p>
                          <p style="margin: 5px 0 0; color: #999; font-size: 14px;">
                            Talla: ${item.size} | Color: ${item.color_name} | Cant: ${item.quantity}
                          </p>
                        </td>
                        <td width="100" style="padding: 10px 0; vertical-align: top; text-align: right;">
                          <p style="margin: 0; color: #333; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>
                  `).join('')}
                  
                  <!-- Total -->
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <table width="100%">
                      <tr>
                        <td style="color: #333; font-size: 18px; font-weight: bold;">Total</td>
                        <td style="color: #009be9; font-size: 18px; font-weight: bold; text-align: right;">$${total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Dirección -->
                  ${address ? `
                    <h3 style="color: #333; margin: 20px 0 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Dirección de envío</h3>
                    <p style="color: #666; line-height: 1.6; margin: 0;">
                      ${address.full_name}<br>
                      ${address.street} #${address.exterior_number}<br>
                      ${address.neighborhood}, ${address.city}<br>
                      ${address.state} ${address.postal_code}
                    </p>
                  ` : ''}

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0 10px;">
                        <a href="http://localhost:5173/pedido/${orderId}" style="background-color: #009be9; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; display: inline-block;">
                          Ver mi pedido
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © 2025 FYTTSA. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Email de contacto (para el admin)
  contactForm: (name: string, email: string, phone: string, subject: string, message: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
              <tr>
                <td style="background: #333; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">Nuevo mensaje de contacto</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p><strong>Nombre:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                  <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                  <p><strong>Mensaje:</strong></p>
                  <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,

  // Email de cambio de estatus del pedido - Estilo moderno
  orderStatusUpdate: (orderId: number, status: string, customerName: string) => {
    const statusInfo: Record<string, { label: string; color: string; bgColor: string; message: string; step: number }> = {
      pending: { label: "Pedido recibido", color: "#0f766e", bgColor: "#ccfbf1", message: "Hemos recibido tu pedido y lo estamos procesando.", step: 1 },
      processing: { label: "Preparando tu pedido", color: "#1d4ed8", bgColor: "#dbeafe", message: "Estamos preparando tu pedido con cuidado.", step: 2 },
      shipped: { label: "En camino", color: "#7c3aed", bgColor: "#ede9fe", message: "Tu pedido está en camino hacia ti.", step: 3 },
      completed: { label: "Entregado", color: "#15803d", bgColor: "#dcfce7", message: "¡Tu pedido ha sido entregado con éxito!", step: 4 },
      cancelled: { label: "Cancelado", color: "#dc2626", bgColor: "#fee2e2", message: "Tu pedido ha sido cancelado.", step: 0 },
    };

    const info = statusInfo[status] || statusInfo.pending;
    const progressPercent = status === 'cancelled' ? 0 : ((info.step - 1) / 3) * 100;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
              
              <!-- Logo/Brand -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0f766e;">FYTTSA</h1>
                </td>
              </tr>

              <!-- Card principal -->
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <!-- Header con estatus -->
                    <tr>
                      <td style="background: linear-gradient(135deg, ${info.bgColor} 0%, #ffffff 100%); padding: 30px 25px 20px;">
                        <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Pedido #${orderId}</p>
                        <h2 style="margin: 0; font-size: 24px; color: ${info.color}; font-weight: 700;">${info.label}</h2>
                      </td>
                    </tr>

                    ${status !== 'cancelled' ? `
                    <!-- Barra de progreso moderna -->
                    <tr>
                      <td style="padding: 25px 25px 10px;">
                        <!-- Barra base -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background-color: #e2e8f0; border-radius: 4px; height: 8px;">
                              <table cellpadding="0" cellspacing="0" style="width: ${progressPercent}%;">
                                <tr>
                                  <td style="background: linear-gradient(90deg, #0d9488, #14b8a6); border-radius: 4px; height: 8px;"></td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Etapas -->
                    <tr>
                      <td style="padding: 5px 20px 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="25%" align="left" style="padding: 5px 0;">
                              <p style="margin: 0; font-size: 11px; color: ${info.step >= 1 ? '#0f766e' : '#94a3b8'}; font-weight: ${info.step === 1 ? '700' : '500'};">Recibido</p>
                            </td>
                            <td width="25%" align="center" style="padding: 5px 0;">
                              <p style="margin: 0; font-size: 11px; color: ${info.step >= 2 ? '#0f766e' : '#94a3b8'}; font-weight: ${info.step === 2 ? '700' : '500'};">Preparando</p>
                            </td>
                            <td width="25%" align="center" style="padding: 5px 0;">
                              <p style="margin: 0; font-size: 11px; color: ${info.step >= 3 ? '#0f766e' : '#94a3b8'}; font-weight: ${info.step === 3 ? '700' : '500'};">Enviado</p>
                            </td>
                            <td width="25%" align="right" style="padding: 5px 0;">
                              <p style="margin: 0; font-size: 11px; color: ${info.step >= 4 ? '#0f766e' : '#94a3b8'}; font-weight: ${info.step === 4 ? '700' : '500'};">Entregado</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ` : `
                    <tr>
                      <td style="padding: 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 12px;">
                          <tr>
                            <td style="padding: 20px; text-align: center;">
                              <p style="color: #dc2626; font-size: 16px; font-weight: 600; margin: 0;">Este pedido ha sido cancelado</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    `}

                    <!-- Mensaje -->
                    <tr>
                      <td style="padding: 0 25px 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0 0 5px; font-size: 14px; color: #334155;">Hola <strong>${customerName}</strong>,</p>
                              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">${info.message}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Botón -->
                    <tr>
                      <td style="padding: 0 25px 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="http://localhost:5173/mis-pedidos" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">
                                Ver detalles del pedido
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 20px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © 2025 FYTTSA. Todos los derechos reservados.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  },
};

export default { sendEmail, emailTemplates };
