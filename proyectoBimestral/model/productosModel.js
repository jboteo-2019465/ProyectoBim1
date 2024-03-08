import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
      
    },
    category: {
        type: String,
        required: true
    }
}, {
    versionKey: false 
})
export default mongoose.model('Product', productSchema)