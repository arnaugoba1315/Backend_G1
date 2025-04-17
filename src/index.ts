import express from 'express';
import userRoutes from './routes/userRoutes';
import referencePointRoutes from './routes/referencePointRoutes';
import activityRoutes from './routes/activityRoutes';
import connectDatabase from './config/db';
import achievementRoutes from './routes/achievementRoutes';
import challengeRoutes from './routes/challengeRoutes';
import songRoutes from './routes/songRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { corsHandler } from './middleware/corsHandler';
import dotenv from 'dotenv';
import setupSwagger from './config/swaggerConfig';
import activityHistoryRoutes from './routes/activityHistoryRoutes';
import http from 'http';
import { Server } from 'socket.io';
import setupSocketIO from './config/socketConfig';

// Cargar variables de entorno
dotenv.config();

// Iniciar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP usando la app de Express
const server = http.createServer(app);

// Inicializar Socket.IO con el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // En producción, limitar a dominios específicos
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configurar Socket.IO
setupSocketIO(io);

setupSwagger(app);

// Middleware
app.use(express.json());
app.use(corsHandler);

// Rutas existentes
app.use('/api/users', userRoutes);
app.use('/api/referencePoints', referencePointRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/activity-history', activityHistoryRoutes);

// Nuevas rutas de chat y notificaciones
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API en funcionament, la documentació es troba a /api-docs.');
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no trobada'
  });
});

// Manejador de errores globales
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
      
    // Usar server.listen en lugar de app.listen para que Socket.IO funcione
    server.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
      console.log(`Socket.IO configurado y escuchando conexiones`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}
  
startServer();