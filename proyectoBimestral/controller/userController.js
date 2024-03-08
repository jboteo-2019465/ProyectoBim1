'use strict'
import User from '../model/userModel.js'
import Cart from '../model/carritoComprasModel.js'
import Producto from '../model/productosModel.js'
import Compra from '../model/comprasModel.js'

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

export const testUser = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is Running' })
}
export const registerUser = async (req, res) => {
    try {
        let { username, password, name, surname, email, phone, role } = req.body
        let userExists = await User.findOne({
            $or: [
                {
                    username
                },
                {
                    email
                }
            ]
        })
        if (userExists) {
            return res.status(500).send({ message: 'Username or/and email in use' })
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        role = 'CLIENT'
        let user = new User({ username, password: hashedPassword, name, surname, email, role, phone });
        await user.save()
        return res.send({ message: `Registered succesfully, welcome ${username}` })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user' })

    }
}

export const registerAdmin = async (req, res) => {
    let { username, password, name, surname, email, phone, role } = req.body
    let userExists = await User.findOne({
        $or: [
            {
                username
            },
            {
                email
            }
        ]
    })
    if (userExists) {
        return res.status(500).send({ message: 'Username or/and email in use' })
    }

    try {
        let hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({ username, name, surname, password: hashedPassword, email, phone, role });
        await user.save();
        return res.send({ message: `Registered succesfully, welcome ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error registering' })
    }
}


export const loginUser = async (req, res) => {
    try {

        let { username, password } = req.body
        let user = await User.findOne({ username })
        // Verificar la contraseña
        let isPasswordValid = bcrypt.compare(password, password);

        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        if (user && isPasswordValid) {
            let loggedUser = {
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = jwt.sign({ id: user._id, loggedUser }, process.env.SECRET_KEY);


            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

//Editar perfil
export const updateUser = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id1 = decodeToken.id
        let role1 = decodeToken.role
        let { id } = req.params
        //Buscar usuario por su id
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }
        //Si es admin tiene la capacidad de editar a cualquier usuario menos la contraseña
        if (role1 = 'ADMIN') {
            let passwrodValid = req.body.password
            if (!passwrodValid) {
                return res.status(404).send({ message: 'old password missing' })
            }

        }
        if (id.role === 'CLIENT') {
            //Actualizar los datos en la base de datos
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.name = req.body.name || user.name;
            user.surname = req.body.surname || user.surname;
            user.telefono = req.body.phone || user.phone;
            user.role = req.body.role || user.role;
            user.password = user.password;
            //Guardar los cambios en la base de datos
            await user.save()
            res.send({ message: 'Actualizado con exito' });
        }

        if (id === id1) {
            //Actualizar los datos en la base de datos
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.name = req.body.name || user.name;
            user.surname = req.body.surname || user.surname;
            user.telefono = req.body.telefono || user.telefono;
            if (isPasswordValid) {
                user.password = req.body.newPassword || user.password;
            } else {
                return res.status(404).send({ message: 'invalid password' })
            }
            user.role = user.role;
            //Guardar los cambios en la base de datos
            await user.save()
            res.send({ message: 'Actualizado con exito' });
        }
        res.status(404).send({ message: 'Unauthorized to update this user' })
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error al actualizar el perfil.' });

    }
}
export const deleteUser = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id1 = decodeToken.id
        let role1 = decodeToken.role
        let { id } = req.params

        if (role1 = 'CLIENT') {
            let deletedUser = await User.findOneAndDelete({ _id: id })
            let carrito = await Cart.findOne({ user: id })
            if (carrito) {
                for (let item of carrito.items) {
                    let producto = await Producto.findById(item.product)

                    if (producto) {
                        producto.stock = parseInt(producto.stock) + parseInt(item.quantity)
                        await producto.save()
                    }
                }
                await Cart.findOneAndDelete({ user: id })
            }
            if (!deletedUser) return res.status(404).send({ message: 'Account not found and not deleted' })
            return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` })

        }
        if (id === id1) {
            let carrito = await Cart.findOne({ user: id })
            if (carrito) {
                for (let item of carrito.items) {
                    let producto = await Producto.findById(item.product)

                    if (producto) {
                        producto.stock = parseInt(producto.stock) + parseInt(item.quantity)
                        await producto.save()
                    }
                }
                await Cart.findOneAndDelete({ user: id })
            }
            let deletedUser = await User.findOneAndDelete({ _id: id })
            if (!deletedUser) return res.status(404).send({ message: 'Account not found and not deleted' })
            return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` })

        }
        res.status(403).send({ message: 'Not Authorized' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting account' })
    }
}

//Historial de compras
export const historialCompras = async (req, res) => {
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id = decodeToken.id

        let compra = await Compra.findOne({user: id})
        
         return res.send({ message: `Compra encontrada`, compra })

    } catch (err) {
        console.error(err)
        return res.status(404).send({ message: 'Error obteniendo el historial' })

    }
}

//Ver productos mas vendidos
export const obtenerProductosMasVendidos = async (req, res) => {
    try {
        // Obtener todas las compras
        let compras = await Compra.find();

        // Objeto para almacenar la frecuencia de cada producto
        let frecuenciaProductos = {};

        // Contar la frecuencia de cada producto en todas las compras
        compras.forEach(compra => {
            compra.items.forEach(item => {
                let productId = item.product.toString();
                if (frecuenciaProductos[productId]) {
                    frecuenciaProductos[productId]++;
                } else {
                    frecuenciaProductos[productId] = 1;
                }
            });
        });

        // Convertir el objeto de frecuencia a un array de objetos
        let productosMasVendidos = await Promise.all(Object.keys(frecuenciaProductos).map(async productId => {
            let producto = await Producto.findById(productId);
            return {
                productName: producto.name,
                vecesComprado: frecuenciaProductos[productId]
            };
        }));

        // Ordenar los productos por número de veces comprado (de mayor a menor)
        productosMasVendidos.sort((a, b) => b.vecesComprado - a.vecesComprado);

        return res.status(200).send(productosMasVendidos);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al obtener los productos más vendidos' });
    }
};