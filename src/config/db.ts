import mongoose, { Mongoose } from "mongoose";
import {Express} from "express";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async () => {
    try{
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ProyectoEA_bd');
        console.log('Conexión exitosa a MongoDB');

  
// Manejadores de eventos para la conexión a MongoDB
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a la base de datos');
    });
    
    mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión de Mongoose:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado de la base de datos');
    });
    
    // Manejador para cerrar la conexión cuando se detiene la aplicación
    process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Conexión de Mongoose cerrada debido a la terminación de la aplicación');
    process.exit(0);
    });
}
catch(error){
  console.error('Error de conexión a MongoDB:', error);
  console.error('Asegúrate de que MongoDB esté ejecutándose en tu sistema');
}
};

export default connectDatabase;