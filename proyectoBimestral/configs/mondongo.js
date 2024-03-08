'use strict'

import mongoose from "mongoose"
import bcrypt from "bcrypt"
import User from '../model/userModel.js'

export const connect = async ()=>{
    try{
        mongoose.connection.on('error', ()=>{
            console.log('MongoDB | could not be connect to mongodb')
            mongoose.disconnect()
        })
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | try connecting')
        })
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | connected to mongodb')
        })
        mongoose.connection.once('open', async ()=>{
            console.log('MongoDB | connected to database');

            //Verificar si hay usuario Admin creado
            const adminExist =  await User.findOne();

            if(!adminExist || !adminExist.role === 'ADMIN'){
                const hashPassword = await bcrypt.hash('12345', 10);
                const defaultAdmin = new User({
                    name: 'defaultAdmin',
                    surname: 'default',
                    username: 'admin',
                    password: hashPassword,
                    email: 'admin@gmail.com',
                    phone: 12345678,
                    role: 'ADMIN'
                });
                await defaultAdmin.save();
                console.log('created default admin', defaultAdmin)
            }
        })
        mongoose.connection.on('reconnected', ()=>{
            console.log('MongoDB | reconected to mongodb')
        })
        mongoose.connection.on('disconnected', ()=>{
            console.log('MongoDB | disconnected')
        })
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50
        })
    }catch(err){
        console.error('Database connection failed',err)
    }
}