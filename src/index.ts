import express from 'express';
import setupSwagger from './config/swaggerConfig';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
// Otros imports...

const app = express();
const PORT = process.env.PORT || 3000;

setupSwagger(app);

// Middleware
//app.use(cors());
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
app.get('/', (req, res) => {
  res.send('API de Ejercicios tipo Strava funcionando. Visita /api-docs para la documentación');
});


// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});
  
connectDatabase();
// Iniciar el servidor solo después de conectar a la base de datos
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
  });

export default app;