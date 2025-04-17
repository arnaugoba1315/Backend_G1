import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

let io: Server;

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
      console.log(`Usuario ${userId} conectado`);
      
      // Almacenar ID de usuario en el socket para uso posterior
      socket.data.userId = userId;
      
      // Emitir lista de usuarios conectados
      emitOnlineUsers();
    }

    // Manejar unión a sala de chat
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} unido a la sala ${roomId}`);
    });

    // Manejar envío de mensajes
    socket.on('send_message', (data: { roomId: string; content: string }) => {
      console.log(`Mensaje recibido: ${data.content} para sala ${data.roomId}`);
      
      // Verificar datos necesarios
      if (!data.roomId || !data.content || !socket.data.userId) {
        return;
      }

      // Crear objeto de mensaje
      const message = {
        id: new mongoose.Types.ObjectId().toString(),
        senderId: socket.data.userId,
        senderName: socket.data.username || 'Usuario',
        content: data.content,
        roomId: data.roomId,
        timestamp: new Date(),
        read: false,
      };

      // Emitir mensaje a todos los sockets en la sala
      io.to(data.roomId).emit('new_message', message);
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
      emitOnlineUsers();
    });
  });

  console.log('Servidor Socket.IO inicializado');
};

// Función para emitir lista de usuarios en línea
const emitOnlineUsers = (): void => {
  const onlineSockets = Array.from(io.sockets.sockets.values());
  const onlineUsers = onlineSockets
    .filter(socket => socket.data.userId)
    .map(socket => socket.data.userId);
  
  // Eliminar duplicados (por si un usuario tiene múltiples conexiones)
  const uniqueOnlineUsers = [...new Set(onlineUsers)];
  
  // Emitir a todos los clientes
  io.emit('user_status', {
    onlineUsers: uniqueOnlineUsers,
  });
};

// Función para enviar notificación a un usuario específico
export const sendNotificationToUser = (ioInstance: unknown, userId: string, notification: any): void => {
  if (!io) return;
  
  const onlineSockets = Array.from(io.sockets.sockets.values());
  const userSockets = onlineSockets.filter(socket => socket.data.userId === userId);
  
  userSockets.forEach(socket => {
    socket.emit('notification', notification);
  });
};

// Exportar instancia de io para uso en otros archivos
export const getIO = (): Server | null => io || null;