import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js';
import { JWT_SECRET } from '../middlewares/auth.middleware.js';
import nodemailer from 'nodemailer';

// URL del frontend para el link de recuperación
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://appbitacora-jv7x.onrender.com';

// Validar que la contraseña sea fuerte (mayús, minús, números)
const validarContraseñaFuerte = (password) => {
  const tieneMinusculas = /[a-z]/.test(password);
  const tieneMayusculas = /[A-Z]/.test(password);
  const tieneNumeros = /[0-9]/.test(password);
  const tieneLongitud = password.length >= 8;

  return {
    esValida: tieneMinusculas && tieneMayusculas && tieneNumeros && tieneLongitud,
    tieneMinusculas,
    tieneMayusculas,
    tieneNumeros,
    tieneLongitud,
    requisitos: [
      { cumple: tieneLongitud, texto: 'Mínimo 8 caracteres' },
      { cumple: tieneMayusculas, texto: 'Al menos una mayúscula (A-Z)' },
      { cumple: tieneMinusculas, texto: 'Al menos una minúscula (a-z)' },
      { cumple: tieneNumeros, texto: 'Al menos un número (0-9)' }
    ]
  };
};

// Configurar transporte de correo con Gmail
const getMailTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[MAIL] Gmail no configurado en .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

// Función para enviar correo de recuperación
const enviarCorreoRecuperacion = async (destinatario, codigo) => {
  const transporter = getMailTransporter();
  const linkRecuperacion = `${FRONTEND_URL}/recuperar-password?correo=${encodeURIComponent(destinatario)}&codigo=${codigo}`;
  
  if (!transporter) {
    console.log(`[MAIL SIMULADO] Código para ${destinatario}: ${codigo}`);
    console.log(`[MAIL SIMULADO] Link: ${linkRecuperacion}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: destinatario,
      subject: 'Código para recuperar tu contraseña - Bitácora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para recuperar tu contraseña.</p>
          <p style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <strong>Tu código de recuperación es:</strong><br>
            <span style="font-size: 24px; color: #007bff; font-weight: bold;">${codigo}</span>
          </p>
          <p style="margin: 20px 0; text-align: center;">
            <a href="${linkRecuperacion}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Cambiar Contraseña Ahora</a>
          </p>
          <p><small>Este código es válido por 1 hora. Si el botón no funciona, copia el código de arriba e ingresalo manualmente.</small></p>
          <p><small>Si no solicitaste este cambio, ignora este correo.</small></p>
        </div>
      `
    });
    console.log(`[MAIL OK] Correo enviado INMEDIATAMENTE a ${destinatario}`);
    return true;
  } catch (error) {
    console.error(`[MAIL ERROR] Error al enviar a ${destinatario}:`, error.message);
    return false;
  }
};

export const login = async (req, res) => {
    try {
        const { usr_usuario, usr_clave } = req.body;

        const [rows] = await conmysql.query(
            'SELECT * FROM usuarios WHERE usr_usuario = ? AND usr_activo = 1',
            [usr_usuario]
        );

        if (rows.length <= 0) {
            return res.status(401).json({ auth: false, message: 'Usuario o contraseña incorrectos' });
        }

        const usuarioDB = rows[0];
        const coinciden = await bcrypt.compare(usr_clave, usuarioDB.usr_clave);

        if (!coinciden) {
            return res.status(401).json({ auth: false, message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuarioDB.usr_id, 
            usuario: usuarioDB.usr_usuario, 
            nombre: usuarioDB.usr_nombre },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            auth: true,
            token: token,
            usuario: { id: usuarioDB.usr_id, nombre: usuarioDB.usr_nombre, usuario: usuarioDB.usr_usuario }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
};

export const registro = async (req, res) => {
    try {
        const { usr_usuario, usr_clave, usr_nombre, usr_correo, usr_telefono } = req.body;

        if (!usr_usuario || !usr_clave || !usr_nombre) {
            return res.status(400).json({ message: 'usr_usuario, usr_clave y usr_nombre son obligatorios' });
        }

        // Validar que la contraseña sea fuerte
        const validacion = validarContraseñaFuerte(usr_clave);
        if (!validacion.esValida) {
            return res.status(400).json({ 
                message: 'La contraseña no cumple los requisitos de seguridad',
                requisitos: validacion.requisitos
            });
        }

        const [existe] = await conmysql.query('SELECT usr_id FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        if (existe.length > 0) {
            return res.status(409).json({ message: 'Ese usuario ya está registrado' });
        }

        const hash = await bcrypt.hash(usr_clave, 10);

        const [result] = await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_correo, usr_telefono) VALUES (?, ?, ?, ?, ?)',
            [usr_usuario, hash, usr_nombre, usr_correo || null, usr_telefono || null]
        );

        const token = jwt.sign(
            { id: result.insertId, usuario: usr_usuario, nombre: usr_nombre },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            auth: true,
            token: token,
            usuario: { id: result.insertId, nombre: usr_nombre, usuario: usr_usuario }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error en el servidor al registrar' });
    }
};

export const solicitarRecuperacion = async (req, res) => {
    try {
        const { usr_correo } = req.body;
        const [rows] = await conmysql.query('SELECT usr_id FROM usuarios WHERE usr_correo = ?', [usr_correo]);

        if (rows.length <= 0) {
            return res.json({ message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.' });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        await conmysql.query(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR) WHERE usr_correo = ?', 
            [codigo, usr_correo]
        );

        // Intentar enviar el correo
        const enviado = await enviarCorreoRecuperacion(usr_correo, codigo);
        
        if (enviado) {
            console.log('[RECOVERY] Código generado y correo enviado exitosamente');
            return res.json({ 
                success: true,
                message: 'Se envió un correo con instrucciones para recuperar tu contraseña.' 
            });
        } else {
            console.log('[RECOVERY] Código generado pero falló el envío de correo');
            return res.json({ 
                success: true,
                message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.' 
            });
        }

    } catch (error) {
        console.log('[ERROR] solicitarRecuperacion:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { usr_correo, token, nuevaClave } = req.body;

        // Validar que la contraseña sea fuerte
        const validacion = validarContraseñaFuerte(nuevaClave);
        if (!validacion.esValida) {
            return res.status(400).json({ 
                success: false,
                message: 'La contraseña no cumple los requisitos de seguridad',
                requisitos: validacion.requisitos
            });
        }

        const [rows] = await conmysql.query(
            'SELECT usr_id FROM usuarios WHERE usr_correo = ? AND reset_token = ? AND UTC_TIMESTAMP() <= reset_token_expires',
            [usr_correo, token]
        );

        if (rows.length <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Código inválido o expirado' 
            });
        }

        const hash = await bcrypt.hash(nuevaClave, 10);
        await conmysql.query(
            'UPDATE usuarios SET usr_clave = ?, reset_token = NULL, reset_token_expires = NULL WHERE usr_id = ?',
            [hash, rows[0].usr_id]
        );

        return res.json({ 
            success: true,
            message: 'Contraseña actualizada correctamente' 
        });
    } catch (error) {
        console.log('[ERROR] resetPassword:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al actualizar' 
        });
    }
};