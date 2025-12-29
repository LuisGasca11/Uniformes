import { Router } from "express";
import pool from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, emailTemplates } from "../services/email.service";

const router = Router();

// Middleware para verificar token
const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// REGISTRO
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = result.rows[0];

    // Crear token (30 días es estándar en e-commerce)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // Enviar email de bienvenida (async, no bloquea la respuesta)
    sendEmail({
      to: user.email,
      subject: "¡Bienvenido a FYTTSA! 🎉",
      html: emailTemplates.welcome(user.name),
    }).catch(err => console.error("Error enviando email de bienvenida:", err));

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Actualizar last_login
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [user.id]
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ACTUALIZAR PERFIL
router.put("/profile", verifyToken, async (req: any, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "El nombre debe tener al menos 2 caracteres" });
    }

    await pool.query(
      "UPDATE users SET name = $1, phone = $2 WHERE id = $3",
      [name.trim(), phone || null, userId]
    );

    return res.json({ message: "Perfil actualizado", name: name.trim(), phone });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// CAMBIAR CONTRASEÑA
router.put("/change-password", verifyToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    // Obtener usuario actual
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    // Hashear nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [newHash, userId]
    );

    return res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Almacén temporal de tokens de recuperación (en producción usar Redis o BD)
const resetTokens = new Map<string, { email: string; expires: Date }>();

// RECUPERAR CONTRASEÑA - Solicitar email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo es requerido" });
    }

    // Verificar si el usuario existe
    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    // Por seguridad, siempre responder igual aunque el email no exista
    if (result.rows.length === 0) {
      return res.json({ 
        message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña" 
      });
    }

    // Generar token único
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Guardar token con expiración de 1 hora
    resetTokens.set(token, {
      email: email.toLowerCase(),
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    });

    // Enviar email de recuperación
    const resetLink = `http://localhost:5173/restablecer-contrasena?token=${token}`;
    const emailSent = await sendEmail({
      to: email.toLowerCase(),
      subject: "Restablecer tu contraseña - FYTTSA",
      html: emailTemplates.resetPassword(resetLink),
    });

    if (!emailSent) {
      console.log(`⚠️ No se pudo enviar email a ${email}, link: ${resetLink}`);
    }

    return res.json({ 
      message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// RESTABLECER CONTRASEÑA - Con token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar token
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    if (new Date() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "El token ha expirado. Solicita uno nuevo." });
    }

    // Hashear nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
      [newHash, tokenData.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Eliminar token usado
    resetTokens.delete(token);

    return res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Verificar token (para validar en frontend)
router.get("/verify-reset-token/:token", (req, res) => {
  const { token } = req.params;
  const tokenData = resetTokens.get(token);
  
  if (!tokenData || new Date() > tokenData.expires) {
    return res.status(400).json({ valid: false, error: "Token inválido o expirado" });
  }
  
  return res.json({ valid: true });
});

export default router;
