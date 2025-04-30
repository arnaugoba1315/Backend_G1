import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import User from '../models/user';
import ActivityModel from '../models/activity';
import mongoose from 'mongoose';

// Estructura para almacenar información de usuarios conectados
interface ConnectedUser {
  socketIds: string[];
  username: string;
  isTracking: boolean;
}

// Estructura para actividades en tiempo real
interface LiveActivity {
  activityId: string;
  ownerId: string;
  followers: string[];
  startTime: Date;
  lastUpdate: Date;
}

// Mapa para almacenar usuarios conectados: userId -> ConnectedUser
const connectedUsers = new Map<string, ConnectedUser>();

// Mapa para almacenar actividades en curso: activityId -> LiveActivity
const liveActivities = new Map<string, LiveActivity>();

// Estructura para mensajes
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

// Estructura para actualizaciones de ubicación
interface LocationUpdate {
  activityId: string;
  userId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  heartRate?: number;
  cadence?: number;
  speed?: number;
}

let io: Server;
let heartbeatInterval: NodeJS.Timeout;

export const initializeSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: "*", // En producción, restringir a tu dominio de frontend
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Habilitar ambos transportes
    maxHttpBufferSize: 1e6, // 1MB para permitir transferencia de datos más grandes
    pingTimeout: 60000, // Aumentar timeout para conexiones inestables
    pingInterval: 25000 // Intervalo de ping
  });

  io.on('connection', async (socket: Socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    // Extraer datos de autenticación
    const { userId, username } = socket.handshake.auth as { 
      userId?: string, 
      username?: string 
    };

    if (userId) {
      await handleUserConnection(socket, userId, username);
    } else {
      console.log(`Socket ${socket.id} conectado sin identificación de usuario`);
    }

    // EVENTOS DE CHAT
    setupChatEvents(socket);
    
    // EVENTOS DE ACTIVIDAD
    setupActivityEvents(socket);

    // Evento de desconexión
    socket.on('disconnect', async () => {
      console.log(`Socket desconectado: ${socket.id}`);
      
      if (socket.data.userId) {
        await handleUserDisconnection(socket);
      }
    });
  });

  // Iniciar envío de heartbeats periódicos para mantener las conexiones activas
  startHeartbeat();

  console.log('Servidor Socket.IO inicializado');
};

// Iniciar heartbeat para mantener las conexiones
function startHeartbeat() {
  // Limpiar intervalo existente si hay uno
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  // Crear nuevo intervalo de heartbeat
  heartbeatInterval = setInterval(() => {
    // Enviar heartbeat a todos los clientes conectados
    io.emit('heartbeat', { timestamp: new Date() });
    
    // Comprobar actividades inactivas
    checkInactiveActivities();
  }, 30000); // cada 30 segundos
}

// Comprobar actividades que podrían estar inactivas
async function checkInactiveActivities() {
  const now = new Date();
  const inactivityThreshold = 5 * 60 * 1000; // 5 minutos en milisegundos
  
  for (const [activityId, activity] of liveActivities.entries()) {
    // Si no hay actualización en 5 minutos, marcar como potencialmente inactiva
    if (now.getTime() - activity.lastUpdate.getTime() > inactivityThreshold) {
      console.log(`Actividad ${activityId} podría estar inactiva, última actualización hace ${Math.round((now.getTime() - activity.lastUpdate.getTime()) / 60000)} minutos`);
      
      // Notificar a los seguidores
      io.to(`activity:${activityId}`).emit('activity_inactivity_warning', {
        activityId,
        lastUpdate: activity.lastUpdate,
        minutesSinceUpdate: Math.round((now.getTime() - activity.lastUpdate.getTime()) / 60000)
      });
      
      // Opcionalmente, podríamos finalizar automáticamente actividades inactivas por mucho tiempo
      // pero es mejor dejar que el usuario decida en la mayoría de los casos
    }
  }
}

// Manejar nueva conexión de usuario
async function handleUserConnection(socket: Socket, userId: string, username?: string) {
  console.log(`Usuario ${username || 'Desconocido'} (${userId}) registrado con socket ${socket.id}`);
  
  // Almacenar datos en el socket
  socket.data.userId = userId;
  socket.data.username = username || 'Usuario';
  
  // Si falta el nombre de usuario, intentar obtenerlo de la base de datos
  let finalUsername = username;
  if (!finalUsername || finalUsername === 'Usuario') {
    try {
      const user = await User.findById(userId);
      if (user) {
        finalUsername = user.username;
        socket.data.username = finalUsername;
      }
    } catch (err) {
      console.error('Error obteniendo datos de usuario:', err);
    }
  }
  
  // Registrar en el mapa de usuarios conectados
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, {
      socketIds: [socket.id],
      username: finalUsername || 'Usuario',
      isTracking: false
    });
  } else {
    const userData = connectedUsers.get(userId);
    if (userData) {
      userData.socketIds.push(socket.id);
      // Actualizar nombre de usuario si tenemos mejor información
      if (finalUsername && finalUsername !== 'Usuario') {
        userData.username = finalUsername;
      }
    }
  }
  
  // Emitir lista actualizada de usuarios en línea
  emitOnlineUsers();
  
  // Unirse a sala específica para este usuario
  socket.join(`user:${userId}`);
  
  // Comprobar si hay una actividad activa para este usuario
  try {
    const activeActivity = await ActivityModel.findOne({
      author: new mongoose.Types.ObjectId(userId),
      status: { $in: ["active", "paused"] }
    });
    
    if (activeActivity) {
      // Unirse a sala de actividad
      socket.join(`activity:${activeActivity._id}`);
      console.log(`Usuario ${userId} unido a sala de actividad activa: ${activeActivity._id}`);
      
      // Actualizar estado de seguimiento
      const userData = connectedUsers.get(userId);
      if (userData) {
        userData.isTracking = true;
      }
      
      // Registrar actividad en vivo si no está ya
      if (!liveActivities.has(activeActivity._id.toString())) {
        liveActivities.set(activeActivity._id.toString(), {
          activityId: activeActivity._id.toString(),
          ownerId: userId,
          followers: [],
          startTime: activeActivity.startTime,
          lastUpdate: activeActivity.lastUpdateTime || new Date()
        });
      }
      
      // Notificar al usuario que tiene una actividad en curso
      socket.emit('ongoing_activity', {
        activityId: activeActivity._id,
        name: activeActivity.name,
        status: activeActivity.status,
        startTime: activeActivity.startTime,
        realTimeStats: activeActivity.realTimeStats
      });
    }
  } catch (error) {
    console.error('Error comprobando actividades activas:', error);
  }
}

// Manejar desconexión de usuario
async function handleUserDisconnection(socket: Socket) {
  const userId = socket.data.userId;
  
  // Eliminar este socket del mapa de usuarios conectados
  const userData = connectedUsers.get(userId);
  if (userData) {
    const updatedSockets = userData.socketIds.filter(id => id !== socket.id);
    
    if (updatedSockets.length > 0) {
      // El usuario todavía tiene otros sockets conectados
      userData.socketIds = updatedSockets;
      connectedUsers.set(userId, userData);
    } else {
      // El usuario ya no tiene ningún socket conectado
      connectedUsers.delete(userId);
      
      // Verificar si tiene actividades en curso y notificar a seguidores
      for (const [activityId, activity] of liveActivities.entries()) {
        if (activity.ownerId === userId) {
          io.to(`activity:${activityId}`).emit('activity_owner_disconnected', {
            activityId,
            ownerId: userId,
            timestamp: new Date()
          });
          console.log(`Propietario de actividad ${activityId} desconectado, notificando a seguidores`);
        }
      }
    }
  }
  
  // Emitir lista actualizada de usuarios en línea
  emitOnlineUsers();
}

// Configurar eventos de chat
function setupChatEvents(socket: Socket) {
  // Unirse a una sala de chat
  socket.on('join_room', (roomId: string) => {
    if (!roomId) return;
    
    socket.join(roomId);
    console.log(`Socket ${socket.id} unido a sala ${roomId}`);
    
    // Notificar a sala que un usuario se unió
    socket.to(roomId).emit('user_joined', {
      userId: socket.data.userId,
      username: socket.data.username,
      roomId
    });
  });

  // Enviar mensaje
  socket.on('send_message', (message: Message) => {
    if (!message.roomId || !message.content) {
      console.error('Datos de mensaje incompletos', message);
      return;
    }
    
    // Asegurar que el mensaje tenga remitente (del socket si no viene en el mensaje)
    const finalMessage = {
      ...message,
      senderId: message.senderId || socket.data.userId,
      senderName: message.senderName || socket.data.username || 'Usuario',
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    console.log(`Mensaje enviado a sala ${finalMessage.roomId}: ${finalMessage.content.substring(0, 30)}...`);
    
    // Emitir mensaje a todos en la sala
    io.to(finalMessage.roomId).emit('new_message', finalMessage);
  });

  // Usuario escribiendo
  socket.on('typing', (roomId: string) => {
    if (!socket.data.userId || !roomId) return;
    
    socket.to(roomId).emit('user_typing', {
      userId: socket.data.userId,
      username: socket.data.username,
      roomId
    });
  });
}

// Configurar eventos de actividad en tiempo real
function setupActivityEvents(socket: Socket) {
  // Unirse a seguir una actividad
  socket.on('join_activity', (activityId: string) => {
    if (!activityId || !socket.data.userId) return;
    
    socket.join(`activity:${activityId}`);
    console.log(`Socket ${socket.id} unido a sala de actividad: ${activityId}`);
    
    // Añadir a seguidores si no es el propietario
    if (liveActivities.has(activityId)) {
      const activity = liveActivities.get(activityId)!;
      if (activity.ownerId !== socket.data.userId && 
          !activity.followers.includes(socket.data.userId)) {
        activity.followers.push(socket.data.userId);
      }
      
      // Notificar al propietario que alguien se unió
      socket.to(`activity:${activityId}`).emit('follower_joined', {
        activityId,
        userId: socket.data.userId,
        username: socket.data.username || 'Usuario'
      });
      
      // Enviar lista de seguidores al nuevo participante
      socket.emit('activity_followers', {
        activityId,
        followers: [
          { userId: activity.ownerId, isOwner: true },
          ...activity.followers.filter(id => id !== socket.data.userId)
                              .map(id => {
                                const user = connectedUsers.get(id);
                                return { 
                                  userId: id, 
                                  username: user?.username || 'Usuario',
                                  isOwner: false
                                };
                              })
        ]
      });
    }
  });
  
  // Dejar de seguir una actividad
  socket.on('leave_activity', (activityId: string) => {
    if (!activityId || !socket.data.userId) return;
    
    socket.leave(`activity:${activityId}`);
    console.log(`Socket ${socket.id} abandonó sala de actividad: ${activityId}`);
    
    // Eliminar de seguidores
    if (liveActivities.has(activityId)) {
      const activity = liveActivities.get(activityId)!;
      const index = activity.followers.indexOf(socket.data.userId);
      if (index !== -1) {
        activity.followers.splice(index, 1);
      }
      
      // Notificar al propietario que alguien dejó de seguir
      socket.to(`activity:${activityId}`).emit('follower_left', {
        activityId,
        userId: socket.data.userId,
        username: socket.data.username || 'Usuario'
      });
    }
  });
  
  // Actualización de ubicación durante actividad
  socket.on('update_location', (update: LocationUpdate) => {
    if (!update.activityId || !socket.data.userId || 
        update.latitude === undefined || update.longitude === undefined) {
      return;
    }
    
    // Solo aceptar actualizaciones del propietario de la actividad
    if (liveActivities.has(update.activityId)) {
      const activity = liveActivities.get(update.activityId)!;
      if (activity.ownerId !== socket.data.userId) {
        console.log(`Rechazada actualización de ubicación de usuario no propietario: ${socket.data.userId}`);
        return;
      }
      
      // Actualizar timestamp de última actualización
      activity.lastUpdate = new Date();
      
      // Reenviar la actualización a todos los seguidores
      socket.to(`activity:${update.activityId}`).emit('location_update', {
        ...update,
        timestamp: new Date()
      });
    }
  });
  
  // Enviar mensaje durante actividad
  socket.on('activity_chat', ({ activityId, message }: { activityId: string, message: string }) => {
    if (!activityId || !message || !socket.data.userId) return;
    
    io.to(`activity:${activityId}`).emit('activity_message', {
      activityId,
      senderId: socket.data.userId,
      senderName: socket.data.username || 'Usuario',
      message,
      timestamp: new Date()
    });
  });
  
  // Enviar alerta durante actividad
  socket.on('emergency_alert', ({ activityId, location, message }: { 
    activityId: string, 
    location: { latitude: number, longitude: number },
    message?: string
  }) => {
    if (!activityId || !location || !socket.data.userId) return;
    
    io.to(`activity:${activityId}`).emit('emergency_alert', {
      activityId,
      userId: socket.data.userId,
      username: socket.data.username || 'Usuario',
      location,
      message: message || 'Solicitud de ayuda de emergencia',
      timestamp: new Date()
    });
    
    console.log(`Alerta de emergencia enviada por usuario ${socket.data.userId} en actividad ${activityId}`);
  });
  
  // Solicitar datos de actividad actuales (para cuando un usuario se une tardíamente)
  socket.on('request_activity_data', (activityId: string) => {
    if (!activityId || !socket.data.userId) return;
    
    // Notificar al propietario que alguien solicita los datos actuales
    if (liveActivities.has(activityId)) {
      const activity = liveActivities.get(activityId)!;
      
      // Solo enviar la solicitud al propietario
      socket.to(`user:${activity.ownerId}`).emit('activity_data_requested', {
        activityId,
        requesterId: socket.data.userId,
        requesterName: socket.data.username || 'Usuario',
        timestamp: new Date()
      });
    }
  });
  
  // Responder con datos actuales de actividad (desde el propietario)
  socket.on('provide_activity_data', ({ activityId, requesterId, data }: {
    activityId: string,
    requesterId: string,
    data: any
  }) => {
    if (!activityId || !requesterId || !data || !socket.data.userId) return;
    
    // Verificar que quien envía es el propietario
    if (liveActivities.has(activityId)) {
      const activity = liveActivities.get(activityId)!;
      if (activity.ownerId !== socket.data.userId) {
        console.log(`Rechazada provisión de datos de usuario no propietario: ${socket.data.userId}`);
        return;
      }
      
      // Enviar datos solo al solicitante
      io.to(`user:${requesterId}`).emit('activity_data_provided', {
        activityId,
        data,
        timestamp: new Date()
      });
    }
  });
}

// Emitir lista de usuarios conectados
function emitOnlineUsers() {
  // Crear array de objetos de usuario con ID y nombre de usuario
  const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, userData]) => ({
    id: userId,
    username: userData.username,
    isTracking: userData.isTracking
  }));
  
  console.log(`Emitiendo lista de usuarios conectados: ${onlineUsers.length} usuarios`);
  io.emit('online_users', onlineUsers);
}

// Obtener instancia de Socket.IO
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};