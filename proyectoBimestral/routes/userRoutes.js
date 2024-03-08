import express from 'express'
import { validateJwt } from '../utils/validator.js'
import {  deleteUser, historialCompras, loginUser, obtenerProductosMasVendidos, registerAdmin, registerUser, testUser, updateUser } from '../controller/userController.js';

const api = express.Router();

//Rutas publicas
api.post('/registerUser', registerUser)
api.post('/registerAdmin', validateJwt, registerAdmin)
api.post('/loginUser', loginUser)


//Rutas privadas
api.get('/testUser', testUser)
api.put('/updateUser/:id', validateJwt, updateUser)
api.delete('/deleteUser/:id', validateJwt, deleteUser)
api.get('/historialCompras',validateJwt, historialCompras)
api.get('/obtenerProductosMasVendidos', obtenerProductosMasVendidos)

export default api