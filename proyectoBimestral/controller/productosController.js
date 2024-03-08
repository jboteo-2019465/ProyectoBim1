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
        console.log(req.body)
      
        if (role === 'CLIENT') { return res.status(500).send({ message: 'Unauthorized role' }) }

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

        let product = new Products({name, description, stock, price, category})
        await product.save()
        return res.send({ message: `Product added` })
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
        let product = await Products.findOne({ name: search })
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
    return res.send({category})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'not found'})
    }
}

//Buscar por categoria
export const obtenerCategoria = async (req, res) => {
    try {
        let { search } = req.body
        if(!search){return res.status(404).send({message: 'No data'})}
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


export const updateProduct = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let { id }  = req.params
        let { name } = req.body
        let product = await Products.findById(id);
        console.log(req.body.price)
        if (!product) {
            return res.status(404).send({ message: 'Product width that Id not found' })
        }
        //Verificar ROl
        if (role === 'CLIENT') { return res.status(404).send({ message: 'Unauthorized role' }) }

        //Verificar si el producto ya esta agregado
        let productExists = await Products.findOne({ name: name })
        if (productExists) { return res.status(404).send({ message: 'Product name alredy Exists' }) }

        //Actualizar datos
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description
        product.stock = req.body.stock || product.stock
        product.price = req.body.price || product.price
        let category = Category.findOne({name: product.category})
        if (!category) {
            category = new Category({ name: category, description: `Category of ${category}` });
            await existingCategory.save();
        }
        product.category = req.body.category || product.category
        await product.save()
        return res.send({ message: 'Product updated' })
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
        if (role === 'CLIENT') { return res.status(500).send({ message: 'Unauthorized role' }) }
     

        let deletedProduct = await Products.findOneAndDelete({ _id: id });
        if (!deletedProduct) return res.status(404).send({ message: 'Product not found and not deleted' });
        return res.send({ message: `Product with name ${deletedProduct.name} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting product' });
    }
}

//Crear categoria
export const crearCategoria = async (req, res)=>{
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let data = req.body
        let {name} = req.body

        if(role === 'CLIENT'){
            return res.status(404).send({message: 'Not authorized'})
        }

        let existingCategory = await Category.findOne( {name} );
        if (existingCategory) {
            return res.status(404).send({message: 'Category alredy exists'})
        }

        let category = new Category(data)
        await category.save()
        return res.send({message: 'Category created'})

    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error creatung category'})
        
    }
}

//Actualizar categoria
export const updateCategory = async(req, res)=>{
    try {
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let role = decodeToken.role
        let{id} = req.params

        let category = await Category.findById(id)
        if(!category){
            return res.status(404).send({message: 'Category not found'})
        }

        if(role === 'CLIENT'){
            return res.status(404).send({message: 'Not authorized'})
        }

        //Actualizar datos
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;

        await category.save()
        res.send({message: 'Category update'})
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating category'})
        
    }
}

//Eliminar categoria
export const eliminarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;

        // Verificar si la categoría existe
        const categoria = await Category.findById(categoriaId);
        if (!categoria) {
            return res.status(404).send({ message: 'Categoría not found' });
        }

        // Verificar si existen productos asociados a la categoría
        const productos = await Products.find({ category: categoriaId });
        if (productos.length > 0) {
            // Transferir los productos a una categoría predeterminada (si tienes una)
            const categoriaPredeterminada = await Category.findOne({ name: 'CategoriaPredeterminada' });
            console.log(categoriaPredeterminada)            

            // Transferir los productos a la categoría predeterminada
            await Products.updateMany({ category: categoriaId }, { category: categoriaPredeterminada.name });
        }

        // Eliminar la categoría
        await Category.findByIdAndDelete(categoriaId);

        return res.status(200).send({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al eliminar la categoría' });
    }
};

