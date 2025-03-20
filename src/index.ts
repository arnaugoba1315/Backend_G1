import express from 'express';
import setupSwagger from './config/swaggerConfig';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import referencePointRoutes from './routes/referencePointRoutes';
import activityRoutes from './routes/activityRoutes';
import connectDatabase from './config/db';
import achievementRoutes from './routes/achievementRoutes';
import challengeRoutes from './routes/challengeRoutes';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

setupSwagger(app);

// Middleware
//app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/referencePoints', referencePointRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('api/challenges', challengeRoutes);
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