import { Server, Socket } from 'socket.io';
import { saveMessage, getMessagesForRoom } from '../services/chatService'; // Importar funciones para manejar mensajes

interface UserConnection {
  userId: string;
  socketId: string;
}

// Mantener un registro de usuarios conectados
const connectedUsers: UserConnection[] = [];

// Configuración de Socket.IO
const setupSocketIO = (io: Server) => {
  // Middleware para autenticación (opcional)
  io.use((socket: Socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Usuario no autenticado'));
    }
    // @ts-ignore
    socket.userId = userId; // Guardar el ID del usuario en el objeto socket
    next();
  });

  // Evento de conexión
  io.on('connection', (socket: Socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
    
    // @ts-ignore
    const userId = socket.userId;
    
    // Registrar al usuario conectado
    connectedUsers.push({
      userId: userId,
      socketId: socket.id
    });
    
    // Informar a todos los usuarios sobre el nuevo usuario conectado
    io.emit('user_status', { 
      userId: userId, 
      status: 'online',
      onlineUsers: connectedUsers.map(u => u.userId)
    });

    // Unirse a una sala de chat
    socket.on('join_room', async (roomId: string) => {
      socket.join(roomId);
      console.log(`Usuario ${userId} unido a la sala ${roomId}`);
      
      // Obtener mensajes anteriores para esta sala
      try {
        const messages = await getMessagesForRoom(roomId);
        socket.emit('previous_messages', messages);
      } catch (error) {
        console.error('Error al obtener mensajes anteriores:', error);
      }
    });

    // Recibir y reenviar mensajes
    socket.on('send_message', async (data: { roomId: string; content: string }) => {
      try {
        // Guardar el mensaje en la base de datos
        const savedMessage = await saveMessage({
          roomId: data.roomId,
          senderId: userId,
          content: data.content,
          timestamp: new Date()
        });
        
        // Enviar mensaje a todos los miembros de la sala
        io.to(data.roomId).emit('new_message', savedMessage);
      } catch (error) {
        console.error('Error al guardar/enviar mensaje:', error);
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    // Enviar notificación a un usuario específico
    socket.on('send_notification', (data: { userId: string; type: string; content: string }) => {
      const targetUser = connectedUsers.find(u => u.userId === data.userId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('notification', {
          type: data.type,
          content: data.content,
          from: userId,
          timestamp: new Date()
        });
      }
    });

    // Manejar escribiendo...
    socket.on('typing', (roomId: string) => {
      socket.to(roomId).emit('user_typing', { userId });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      
      // Eliminar de la lista de conectados
      const index = connectedUsers.findIndex(u => u.socketId === socket.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }
      
      // Informar a todos los usuarios sobre el usuario desconectado
      io.emit('user_status', { 
        userId: userId, 
        status: 'offline',
        onlineUsers: connectedUsers.map(u => u.userId)
      });
    });
  });

  return io;
};

// Función de utilidad para enviar notificaciones desde cualquier parte del código
export const sendNotificationToUser = (io: Server, userId: string, notification: any) => {
  const targetUser = connectedUsers.find(u => u.userId === userId);
  if (targetUser) {
    io.to(targetUser.socketId).emit('notification', notification);
    return true;
  }
  return false;
};

export default setupSocketIO;