import Products from '../model/productosModel.js'
import Category from '../model/categoryModel.js'
import jwt from 'jsonwebtoken';

export const testProduct = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Registrar Producto
export const registerProduct = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id = decodeToken.id
        let role = decodeToken.role

        if (role === 'ADMIN') {
            let { name, description, stock, price, category } = req.body

            //Verificar si la categoria existe
            let existingCategory = await Category.findOne({ name: category });
            if (!existingCategory) {
                existingCategory = new Category({ name: category, description: `Category of ${category}` });
                await existingCategory.save();
            }

            //Verificar si el producto ya existe para aumentar el stock
            let addStock = await Products.findOne({ name: name })
            if (addStock) {
                return res.status(404).send({ message: 'Product alredy exists' })
            }

            let product = new Products({ name, description, stock, price, category })
            await product.save()
            return res.send({ message: `Product added`, product })

        }


        return res.status(500).send({ message: 'Unauthorized role' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering product' })
    }
}

export const obtenerProduct = async (req, res) => {
    try {
        const products = await Products.find();
        return res.send(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error retrieving product' })
    }
}

//Buscar individualmente
export const obtenerIndividualmente = async (req, res) => {
    try {
        let { search } = req.body
        let product = await Products.findOne({ name: { $regex: search, $options: 'i' } })
        if (!product) {
            return res.status(404).send({ message: 'Product not found' })
        }
        return res.send({ message: `product Found`, product })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error retrieving product' })
    }
}

//Explorar las categorias existentes
export const getCategorys = async (req, res) => {
    try {
        let category = await Category.find()
        return res.send({ category })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'not found' })
    }
}

//Buscar por categoria
export const obtenerCategoria = async (req, res) => {
    try {
        let { search } = req.body
        if (!search) { return res.status(404).send({ message: 'No data' }) }
        let product = await Products.findOne({ category: search })
        if (!product) {
            return res.status(404).send({ message: 'Product not found' })
        }
        return res.send({ message: `products Found`, product })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error retrieving product' })
    }
}

//Productos Agotados
export const agotados = async (req, res) => {
    try {
        let products = await Products.find({ stock: 0 })
        if (!products) {
            return res.status(404).send({ message: 'out of stock products not found' })
        }
        return res.send({ products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting products' })

    }
}


export const updateProduct = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let { id } = req.params
        let { name } = req.body
        let product = await Products.findById(id);
        console.log(req.body.price)
        if (!product) {
            return res.status(404).send({ message: 'Product width that Id not found' })
        }
        //Verificar ROl
        if (role === 'ADMIN') {
            //Verificar si el producto ya esta agregado
            let productExists = await Products.findOne({ name: name })
            if (productExists) { return res.status(404).send({ message: 'Product name alredy Exists' }) }

            //Actualizar datos
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description
            product.stock = req.body.stock || product.stock
            product.price = req.body.price || product.price
            let category = Category.findOne({ name: product.category })
            if (!category) {
                category = new Category({ name: category, description: `Category of ${category}` });
                await existingCategory.save();
            }
            product.category = req.body.category || product.category
            await product.save()
            return res.send({ message: 'Product updated' })
        }


        return res.status(404).send({ message: 'Unauthorized role' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating product' })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let { id } = req.params;
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role;
        console.log(role);
        if (role === 'ADMIN') {
            let deletedProduct = await Products.findOneAndDelete({ _id: id });
            if (!deletedProduct) return res.status(404).send({ message: 'Product not found and not deleted' });
            return res.send({ message: `Product with name ${deletedProduct.name} deleted successfully` });
        }

        return res.status(500).send({ message: 'Unauthorized role' })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting product' });
    }
}

//Crear categoria
export const crearCategoria = async (req, res) => {
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let data = req.body
        let { name } = req.body

        if (role === 'ADMIN') {
            let existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(404).send({ message: 'Category alredy exists' })
            }

            let category = new Category(data)
            await category.save()
            return res.send({ message: 'Category created' })

        }


        return res.status(404).send({ message: 'Not authorized' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creatung category' })

    }
}

//Actualizar categoria
export const updateCategory = async (req, res) => {
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let { id } = req.params

        let category = await Category.findById(id)
        if (!category) {
            return res.status(404).send({ message: 'Category not found' })
        }

        if (role === 'ADMIN') {
            //Actualizar datos
            category.name = req.body.name || category.name;
            category.description = req.body.description || category.description;

            await category.save()
            res.send({ message: 'Category update' })
        }

        return res.status(404).send({ message: 'Not authorized' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating category' })

    }
}

//Eliminar categoria
export const eliminarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role

        // Verificar si la categoría existe
        let categoria = await Category.findByIdAndDelete({ _id: categoriaId });
        if (!categoria) {
            return res.status(404).send({ message: 'Categoría not found' });
        }
        if (role === 'ADMIN') {
            // Verificar si existen productos asociados a la categoría
            const categoryDefault = await Category.findOne({ name: 'default' })
            console.log(categoryDefault)
            let updateCategoryProduct = await Products.updateMany(
                { category: categoriaId },
                { $set: { category: categoryDefault.name } }

            )
            // Eliminar la categoría
            return res.status(200).send({ message: 'Categoría eliminada exitosamente' });

        }


        return res.status(404).send({ message: 'Not authorized' })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al eliminar la categoría' });
    }
};

