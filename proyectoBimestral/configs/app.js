'use strict'

//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import userRoutes from '../routes/userRoutes.js'
import productRoutes from '../routes/productRoutes.js'
import carritoComprasRoutes from '../routes/carritoCompras.js'
import comprasRoutes from '../routes/comprasRoutes.js'




const app = express()
    config();
    const port = process.env.PORT || 2622

    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(morgan('dev'))

    app.use(userRoutes)
    app.use(productRoutes)
    app.use(carritoComprasRoutes)
    app.use(comprasRoutes)



    export const initServer = ()=>{
        app.listen(port)
        console.log(`Server HTTP running in port ${port}`)
    }