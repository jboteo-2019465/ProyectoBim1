import express from 'express'
import { agotados, crearCategoria, eliminarCategoria, getCategorys, obtenerCategoria, obtenerIndividualmente, updateCategory } from '../controller/productosController.js';
import { validateJwt } from '../utils/validator.js'
import { deleteProduct, obtenerProduct, registerProduct, testProduct, updateProduct } from '../controller/productosController.js';


const api = express.Router();

api.get('/testProduct', testProduct)
api.post('/registerProduct', validateJwt, registerProduct)
api.get('/obtenerProduct', obtenerProduct)
api.delete('/deleteProduct/:id', validateJwt, deleteProduct)
api.put('/updateProduct/:id', validateJwt, updateProduct)

api.post('/obtenerIndividualmente', obtenerIndividualmente)
api.get('/productosAgotados', agotados)

//Categoria
api.post('/obtenerCategoria', obtenerCategoria)
api.get('/getCategorys', getCategorys)
api.post('/agregarCategoria', validateJwt, crearCategoria)
api.put('/updateCategory/:id', validateJwt, updateCategory)
api.delete('/eliminarCategoria/:id', validateJwt, eliminarCategoria)


export default api 