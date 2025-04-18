import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { sendNotificationToUser as importedSendNotificationToUser } from '../config/socketConfig';
import * as notificationService from '../services/notificationService';

let io: Server;
const connectedUsers = new Map<string, Socket[]>();

export const initializeSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: '*', // En producción, limitar a dominios específicos
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    // Almacenar el ID de usuario si se proporciona
    if (socket.handshake.auth && socket.handshake.auth.userId) {
      const userId = socket.handshake.auth.userId;
      const username = socket.handshake.auth.username || 'Usuario';
      console.log(`Usuario ${userId} (${username}) conectado`);
      
      // Almacenar datos de usuario en el socket
      socket.data.userId = userId;
      socket.data.username = username;
      
      // Almacenar conexión en nuestro mapa de usuarios conectados
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, []);
      }
      connectedUsers.get(userId)!.push(socket);
      
      // Emitir lista de usuarios conectados
      emitOnlineUsers();
    }

    // Manejar unión a sala de chat
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} unido a la sala ${roomId}`);
    });

    // Manejar envío de mensajes
    socket.on('send_message', async (data: { roomId: string; content: string; id?: string }) => {
      console.log(`Mensaje recibido: ${data.content} para sala ${data.roomId}`);
      
      // Verificar datos necesarios
      if (!data.roomId || !data.content || !socket.data.userId) {
        return;
      }

      // Crear objeto de mensaje
      const message = {
        id: data.id || new mongoose.Types.ObjectId().toString(),
        senderId: socket.data.userId,
        senderName: socket.data.username || 'Usuario',
        content: data.content,
        roomId: data.roomId,
        timestamp: new Date(),
        read: false,
      };

      // Emitir mensaje a todos los sockets en la sala
      io.to(data.roomId).emit('new_message', message);
      
      // Obtener participantes de la sala y enviar notificaciones
      try {
        // Aquí obtendrías los participantes del room desde la base de datos
        // Por ejemplo: const room = await ChatRoomModel.findById(data.roomId);
        
        // Luego enviar notificación a cada participante que no sea el remitente
        for (const [userId, sockets] of connectedUsers.entries()) {
          if (userId !== socket.data.userId && socket.rooms.has(data.roomId)) {
            // Crear notificación
            const notification = {
              userId: userId,
              type: 'message',
              content: `Nuevo mensaje de ${socket.data.username} en el chat`,
              relatedId: data.roomId,
              timestamp: new Date()
            };
            
            // Crear en la base de datos y enviar a través de Socket.IO
            await notificationService.createNotification(notification);
          }
        }
      } catch (error) {
        console.error('Error al enviar notificaciones de mensaje:', error);
      }
    });

    // Manejar estado "escribiendo..."
    socket.on('typing', (roomId: string) => {
      if (!socket.data.userId) return;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.data.userId,
        username: socket.data.username || 'Usuario',
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
  const userSockets = connectedUsers.get(userId) || [];
  
  userSockets.forEach(socket => {
    socket.emit('notification', notification);
  });
};

// Exportar instancia de io para uso en otros archivos
export const getIO = (): Server | null => io || null;