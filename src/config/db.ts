import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        mongoose.set('strictQuery', true);

        const conexion = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/BackendProjecte");
        console.log(`Connected to MongoDB successfully: ${conexion.connection.host}`);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1); 
    }
};

export default conectarDB;