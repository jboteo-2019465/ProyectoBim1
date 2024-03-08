import express from 'express'
import { agregarAlCarrito, eliminarCarrito } from '../controller/carritoComprasController.js'
import { validateJwt } from '../utils/validator.js'

const api = express.Router();

api.post('/agregarAlCarrito', validateJwt, agregarAlCarrito)
api.get('/eliminarCarrito', validateJwt, eliminarCarrito)

export default api