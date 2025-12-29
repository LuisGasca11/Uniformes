import { Router } from "express";
import { sendEmail, emailTemplates } from "../services/email.service";

const router = Router();

// Enviar formulario de contacto
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Nombre, email y mensaje son requeridos" });
    }

    // Enviar email al admin
    const emailSent = await sendEmail({
      to: process.env.EMAIL_FROM || "romerozavalabrandon@gmail.com",
      subject: `Nuevo mensaje de contacto: ${subject || "Sin asunto"}`,
      html: emailTemplates.contactForm(name, email, phone || "", subject || "", message),
    });

    if (!emailSent) {
      return res.status(500).json({ error: "Error al enviar el mensaje" });
    }

    // Opcional: enviar confirmación al usuario
    await sendEmail({
      to: email,
      subject: "Recibimos tu mensaje - FYTTSA",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #009be9 0%, #0077b6 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0;">¡Mensaje recibido!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #666; line-height: 1.6;">
                        Hola <strong>${name}</strong>,
                      </p>
                      <p style="color: #666; line-height: 1.6;">
                        Hemos recibido tu mensaje y te responderemos lo antes posible. 
                        Generalmente respondemos en menos de 24 horas hábiles.
                      </p>
                      <p style="color: #999; font-size: 14px; margin-top: 30px;">
                        Gracias por contactarnos,<br>
                        <strong>Equipo FYTTSA</strong>
                      </p>
                    </td>
                  </tr>
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
    });

    return res.json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
