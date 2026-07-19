import jwt from 'jsonwebtoken';

const JWT_SECRET = 'segura2026'; // en producción cámbialo y muévelo a .env

export const verificarToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        try {
            const token = bearerHeader.split(' ')[1];
            const certificado = jwt.verify(token, JWT_SECRET);
            req.usuario = certificado;
            next();
        } catch (error) {
            return res.status(403).json({
                auth: false,
                message: 'Token inválido, no autorizado o expirado.'
            });
        }
    } else {
        return res.status(401).json({
            auth: false,
            message: 'Acceso denegado. Token no proporcionado.'
        });
    }
};

export { JWT_SECRET };
