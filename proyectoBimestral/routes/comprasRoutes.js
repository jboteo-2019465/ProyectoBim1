import express from 'express'
import { generarFactura, procesarPago, updateBuys } from '../controller/comprasController.js'
import { validateJwt } from '../utils/validator.js'

const api = express.Router();

api.get('/procesarPago', validateJwt, procesarPago)
//Factura
api.get('/generarFactura', validateJwt, generarFactura)
api.put('/updateBuy/:id', validateJwt, updateBuys)

export default api