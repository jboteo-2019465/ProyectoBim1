import Compra from '../model/comprasModel.js'
import Cart from '../model/carritoComprasModel.js';
import Producto from '../model/productosModel.js'
import jwt from 'jsonwebtoken';
import PDFdocu from 'pdfkit';
import fs from 'fs'
import path from 'path';


export const procesarPago = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token
        let token = req.headers.authorization;
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        let id = decodeToken.id;

        // Obtener los productos en el carrito del usuario
        let carrito = await Cart.findOne({ user: id })


        // Verificar si el carrito está vacío
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).send({ message: 'No hay productos en el carrito' });
        }

        // Calcular el total de la compra
        let totalCompra = 0;
        for (let item of carrito.items) {
            totalCompra += parseInt(item.price);
        }
        console.log(totalCompra)

        // Verificar disponibilidad de stock para cada producto en el carrito
        for (let item of carrito.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).send({ message: `No hay suficiente stock para el producto` });
            }

        }

        let compra = new Compra({
            user: id,
            carrito: carrito._id,
            items: carrito.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            total: totalCompra
        });
        await compra.save();

        // Limpiar el carrito del usuario
        await Cart.updateOne({ user: id }, { $set: { items: [] } })

        return res.status(200).send({ message: 'Pago procesado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al procesar el pago' });
    }
};

//Generar la factura
export const generarFactura = async (req, res) => {
    try {
        //Sacar id del token
        let token = req.headers.authorization;
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        let id = decodeToken.id;
        let date = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' })

        //Buscar la compra asociada al usuario
        let compra = await Compra.findOne({ user: id }).populate('user').populate('items.product')
        if (!compra) {
            return res.status(404).send({ message: 'Compra no encontrada' })
        }

        //Crear el documento pdf
        let doc = new PDFdocu();
        const filePath = path.resolve('factura.pdf');
        doc.pipe(fs.createWriteStream(filePath));

        //Agregar contenido al PDF
        doc.image('img/sat.png', { width: 100 })
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(17).text(`----------- Factura No. ${compra._id} -----------`, { aling: 'center', bold: true });
        doc.moveDown();


        doc.font('Helvetica').fontSize(14).text(`Fecha: ${date}`, { align: 'left' })
        doc.text(`Cliente: ${compra.user.name}`, { align: 'left' })
        doc.moveDown();

        doc.font('Helvetica-Bold').fontSize(17).text('Products');
        doc.moveDown()
        compra.items.forEach((item, index) => {
            doc.font('Helvetica').fontSize(14).text(`${index + 1}. ${item.product.name}      -      Cantidad: ${item.quantity}      -      Precio Unitario: Q${item.product.price}`)
        });

        doc.moveDown();
        doc.font('Helvetica-Bold').text('--------------------------------------------------------------------')

        doc.text(`Total a pagar: Q${compra.total}`);

        //Cerrar el PDF
        doc.end();

        //Enviar el pdf como respuesta
        res.sendFile(filePath);
        return res.send({ message: 'Factura generada con exito' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al generar la factura' });

    }
}

//Actualizar compra/factura
export const updateBuys = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let { id } = req.params

        let compra = await Compra.findById(id)
        if (!compra) {
            return res.status(404).send({ message: 'Buy not found' })
        }

        if (role === 'ADMIN') {

            compra.user = req.body.user || compra.user;
            compra.carrito = req.body.carrito || compra.carrito
            compra.items.product = req.body.product || compra.items.product
            compra.items.quantity = req.body.quantity || compra.items.quantity
            compra.items.price = req.body.price || compra.items.price
            compra.total = req.body.total || compra.total
            compra.fecha = compra.fecha

            await compra.save()
            res.send({ message: 'Actualizado con exito' });
        }
        return res.status(404).send({ message: 'Unauthorized' })





    } catch (err) {
        console.error(err)

    }
}
