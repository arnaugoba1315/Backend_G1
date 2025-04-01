import express from 'express';
import userRoutes from './routes/userRoutes';
import referencePointRoutes from './routes/referencePointRoutes';
import activityRoutes from './routes/activityRoutes';
import connectDatabase from './config/db';
import achievementRoutes from './routes/achievementRoutes';
import challengeRoutes from './routes/challengeRoutes';
import songRoutes from './routes/songRoutes';
import { corsHandler } from './middleware/corsHandler';
import dotenv from 'dotenv';
import setupSwagger from './config/swaggerConfig';
import activityHistoryRoutes from './routes/activityHistoryRoutes';

//Carregar variables d'entorn
dotenv.config();

//Iniciar Express
const app = express();
const PORT = process.env.PORT || 3000;

setupSwagger(app);

//Middleware
app.use(express.json());
app.use(corsHandler);

//Rutes
app.use('/api/users', userRoutes);
app.use('/api/referencePoints', referencePointRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/activity-history', activityHistoryRoutes);
app.get('/', (req, res) => {
  res.send('API en funcionament, la documentació es troba a /api-docs.');
});


//Manejador de rutes no trobades
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no trobada'
  });
});

//Manejador d'errors globals
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Error intern del servidor'
  });
});

async function startServer() {
  try {
    await connectDatabase();
      
    //Indicar per consola que s'ha iniciat el servidor correctament
    app.listen(PORT, () => {
      console.log(`Servidor executant-se en http://localhost:${PORT}`); //Important el tipus de cometes utilitzades aquí per poder pasar la variable PORT
      console.log(`Documentació disponible en http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
}
  
startServer();