import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { conmysql } from '../db.js';
import { JWT_SECRET } from '../middlewares/auth.middleware.js';

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
