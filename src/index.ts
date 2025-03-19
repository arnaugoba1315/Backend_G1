import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Importar rutas
import userRoutes from './routes/userRoutes';


// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3143;

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

// Rutas añadir las que faltan
app.use('/api/users', userRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de Ejercicios tipo Strava funcionando. Visita /api-docs para la documentación');
});

// Conexión a MongoDB con manejo mejorado de errores
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/BackendProjecte')
  .then(() => {
    console.log('📊 Conexión exitosa a MongoDB');
    
    // Iniciar el servidor solo después de conectar a la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📝 Documentación disponible en http://localhost:${PORT}/api-docs`);
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