import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        mongoose.set('strictQuery', true); // Mantiene el comportamiento actual

        const conexion = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/api_base_de_datos");
        console.log(`Connected to MongoDB successfully: ${conexion.connection.host}`);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1); 
    }
};

export default conectarDB;