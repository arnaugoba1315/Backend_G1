import express from 'express';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
// Otros imports...

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Conectar a MongoDB
connectDB()
  .then(() => {
    // Iniciar el servidor una vez conectado a la base de datos
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed', err);
  });

// Rutas
app.use('/api/users', userRoutes);
// Otras rutas...