import express from 'express'
import { generarFactura, procesarPago } from '../controller/comprasController.js'
import { validateJwt } from '../utils/validator.js'

const api = express.Router();

api.get('/procesarPago', validateJwt, procesarPago)
//Factura
api.get('/generarFactura', validateJwt, generarFactura)

export default api