import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Importar configuración de Socket.IO
import { initializeSocket } from './config/socketConfig';

// Importar rutas
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
// Importar otras rutas cuando estén disponibles

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3143;

// Crear servidor HTTP para Socket.IO
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Ejercicios - Tipo Strava',
      version: '1.0.0',
      description: 'API para gestionar actividades físicas, logros, desafíos y más',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'Rutas relacionadas con la gestión de usuarios',
      },
      {
        name: 'Activities',
        description: 'Rutas relacionadas con actividades físicas',
      },
      {
        name: 'Achievements',
        description: 'Rutas relacionadas con logros',
      },
      {
        name: 'Challenges',
        description: 'Rutas relacionadas con desafíos',
      },
      {
        name: 'ReferencePoints',
        description: 'Rutas relacionadas con puntos de referencia',
      },
      {
        name: 'Songs',
        description: 'Rutas relacionadas con canciones',
      },
      {
        name: 'Chat',
        description: 'Rutas relacionadas con el chat',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Apunta a las rutas de tu aplicación
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Ejercicios tipo Strava funcionando. Visita /api-docs para la documentación');
});

// Conexión a MongoDB con manejo mejorado de errores
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/BackendProjecte')
  .then(() => {
    console.log('📊 Conexión exitosa a MongoDB');
    
    // Inicializar Socket.IO
    initializeSocket(server);
    
    // Iniciar el servidor HTTP (no app.listen) solo después de conectar a la base de datos
    server.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📝 Documentación disponible en http://localhost:${PORT}/api-docs`);
      console.log(`🔌 Socket.IO listo para conexiones`);
    });
  })
  .catch((error) => {
    console.error('❌ Error de conexión a MongoDB:', error);
    console.error('👉 Asegúrate de que MongoDB esté ejecutándose en tu sistema');
  });

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

export default app;