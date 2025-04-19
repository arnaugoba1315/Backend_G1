import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as notificationService from '../services/notificationService';

let io: Server;
const connectedUsers = new Map<string, Socket[]>();
// Mapa para rastrear a qué salas se ha unido cada socket
const socketRooms = new Map<string, Set<string>>();

export const initializeSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: '*', // En producción, limitar a dominios específicos
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    // Almacenar el ID de usuario si se proporciona
    if (socket.handshake.auth && socket.handshake.auth.userId) {
      const userId = socket.handshake.auth.userId;
      const username = socket.handshake.auth.username || 'Usuario';
      console.log(`Usuario ${userId} (${username}) conectado con socket ${socket.id}`);
      
      // Almacenar datos de usuario en el socket
      socket.data.userId = userId;
      socket.data.username = username;
      
      // Almacenar conexión en nuestro mapa de usuarios conectados
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, []);
      }
      connectedUsers.get(userId)!.push(socket);
      
      // Inicializar conjunto de salas para este socket
      socketRooms.set(socket.id, new Set<string>());
      
      // Emitir lista de usuarios conectados
      emitOnlineUsers();
    }

    // Manejar unión a sala de chat
    socket.on('join_room', (roomId: string) => {
      // Añadir la sala al conjunto de salas de este socket
      if (socketRooms.has(socket.id)) {
        socketRooms.get(socket.id)!.add(roomId);
      } else {
        socketRooms.set(socket.id, new Set([roomId]));
      }
      
      socket.join(roomId);
      console.log(`Socket ${socket.id} unido a la sala ${roomId}`);
      
      // Notificar a todos los usuarios conectados que alguien se unió a la sala
      io.to(roomId).emit('user_joined_room', {
        userId: socket.data.userId,
        username: socket.data.username,
        roomId: roomId
      });
    });

    // Manejar envío de mensajes
    socket.on('send_message', async (data: { 
      id?: string; 
      roomId: string; 
      content: string;
      senderId?: string;
      senderName?: string;
      timestamp?: string;
    }) => {
      console.log(`Mensaje recibido para sala ${data.roomId}: ${data.content}`);
      
      // Verificar datos necesarios
      if (!data.roomId || !data.content) {
        console.error('Datos de mensaje incompletos:', data);
        return;
      }

      // Si no se proporciona senderId, usar el del socket
      const senderId = data.senderId || socket.data.userId;
      const senderName = data.senderName || socket.data.username || 'Usuario';

      // Crear objeto de mensaje completo
      const message = {
        id: data.id || new mongoose.Types.ObjectId().toString(),
        senderId: senderId,
        senderName: senderName,
        content: data.content,
        roomId: data.roomId,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      console.log(`Enviando mensaje a sala ${data.roomId}:`, message);
      
      // Emitir mensaje a todos los sockets en la sala, incluyendo el remitente
      io.to(data.roomId).emit('new_message', message);
      
      // Log para depuración
      const socketsInRoom = await io.in(data.roomId).fetchSockets();
      console.log(`Sockets en la sala ${data.roomId}: ${socketsInRoom.length}`);
      for (const s of socketsInRoom) {
        console.log(`- Socket ${s.id}, userId: ${s.data.userId}`);
      }
      
      // Notificar a los usuarios que no estén mirando esta sala
      try {
        for (const [userId, sockets] of connectedUsers.entries()) {
          // No enviar notificación al remitente
          if (userId !== senderId) {
            // Verificar si alguno de los sockets del usuario está en esta sala
            let isInRoom = false;
            for (const s of sockets) {
              if (socketRooms.has(s.id) && socketRooms.get(s.id)!.has(data.roomId)) {
                isInRoom = true;
                break;
              }
            }
            
            // Si no está en la sala, enviar una notificación
            if (!isInRoom) {
              // Crear notificación
              const notification = {
                userId: userId,
                type: 'message',
                content: `Nuevo mensaje de ${senderName} en el chat`,
                relatedId: data.roomId,
                timestamp: new Date().toISOString()
              };
              
              // Emitir notificación
              for (const s of sockets) {
                s.emit('notification', notification);
              }
              
              // Guardar en base de datos
              await notificationService.createNotification(notification);
            }
          }
        }
      } catch (error) {
        console.error('Error al enviar notificaciones de mensaje:', error);
      }
    });

    // Crear una nueva sala de chat
    socket.on('create_chat_room', async (data: {
      name: string;
      participants: string[];
      description?: string;
    }) => {
      console.log('Solicitud para crear sala de chat:', data);
      
      if (!data.name || !data.participants || data.participants.length === 0) {
        console.error('Datos incompletos para crear sala:', data);
        return;
      }
      
      // Crear ID para la sala
      const roomId = Date.now().toString();
      
      // Crear objeto de sala
      const room = {
        id: roomId,
        name: data.name,
        description: data.description || '',
        participants: data.participants,
        createdAt: new Date().toISOString(),
        createdBy: socket.data.userId || '',
      };
      
      console.log(`Nueva sala de chat creada: ${roomId}`, room);
      
      // Unir al creador a la sala
      socket.join(roomId);
      if (socketRooms.has(socket.id)) {
        socketRooms.get(socket.id)!.add(roomId);
      } else {
        socketRooms.set(socket.id, new Set([roomId]));
      }
      
      // Notificar a todos los participantes sobre la nueva sala
      for (const participantId of data.participants) {
        if (connectedUsers.has(participantId)) {
          for (const s of connectedUsers.get(participantId)!) {
            // Enviar información de la sala al usuario
            s.emit('new_chat_room', room);
            
            // También unir este socket a la sala
            s.join(roomId);
            if (socketRooms.has(s.id)) {
              socketRooms.get(s.id)!.add(roomId);
            } else {
              socketRooms.set(s.id, new Set([roomId]));
            }
          }
        }
      }
      
      // Emitir evento de nueva sala creada a todos los participantes
      io.to(roomId).emit('room_created', room);
    });

    // Manejar estado "escribiendo..."
    socket.on('typing', (roomId: string) => {
      if (!socket.data.userId) return;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.data.userId,
        username: socket.data.username || 'Usuario',
        roomId: roomId
      });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
      
      // Eliminar socket de nuestro mapa de usuarios conectados
      if (socket.data.userId) {
        const userId = socket.data.userId;
        const sockets = connectedUsers.get(userId) || [];
        const index = sockets.findIndex(s => s.id === socket.id);
        
        if (index !== -1) {
          sockets.splice(index, 1);
          
          // Si no quedan sockets para este usuario, eliminarlo del mapa
          if (sockets.length === 0) {
            connectedUsers.delete(userId);
          }
        }
      }
      
      // Eliminar registro de salas para este socket
      socketRooms.delete(socket.id);
      
      emitOnlineUsers();
    });
  });

  console.log('Servidor Socket.IO inicializado');
};

// Función para emitir lista de usuarios en línea
const emitOnlineUsers = (): void => {
  const onlineUserIds = Array.from(connectedUsers.keys());
  
  // Emitir a todos los clientes
  io.emit('user_status', {
    onlineUsers: onlineUserIds,
  });
};

// Función para enviar notificación a un usuario específico
export const sendNotificationToUser = (ioInstance: unknown, userId: string, notification: any): void => {
  if (!io) {
    if (ioInstance && typeof ioInstance === 'object') {
      io = ioInstance as Server;
    } else {
      console.error('No se ha inicializado el servidor Socket.IO');
      return;
    }
  }
  
  const userSockets = connectedUsers.get(userId) || [];
  
  userSockets.forEach(socket => {
    socket.emit('notification', notification);
  });
};

// Exportar instancia de io para uso en otros archivos
export const getIO = (): Server | null => io || null;