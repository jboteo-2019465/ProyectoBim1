import jwt from 'jsonwebtoken';

// Middleware para validar el token JWT
export const validateJwt = (req, res, next) => {
    // Obtener el token de los headers de la solicitud
    const token = req.headers.authorization;
    // Verificar si el token existe
    if (!token) {
        return res.status(401).send({ message: 'Token de autenticación no proporcionado.' });
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // Añadir el objeto decodificado al objeto de solicitud para uso posterior
        req.user = decoded;
        // Pasar al siguiente middleware
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({ message: 'Token de autenticación inválido.' });
    }
};