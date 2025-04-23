import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

// Mapa para almacenar los usuarios conectados: userId -> socketId
const connectedUsers = new Map<string, string[]>();

// Estructura para almacenar mensajes temporales
interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

let io: Server;

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

    // Registro de usuario al conectar
    socket.on('register_user', (userData: { userId: string, username: string }) => {
      const { userId, username } = userData;
      
      if (!userId) {
        console.error('Se intentó registrar un usuario sin ID');
        return;
      }

      console.log(`Usuario ${username} (${userId}) registrado con socket ${socket.id}`);
      
      // Almacenar datos en el socket
      socket.data.userId = userId;
      socket.data.username = username;
      
      // Registrar en el mapa de usuarios conectados
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, [socket.id]);
      } else {
        connectedUsers.get(userId)?.push(socket.id);
      }
      
      // Emitir lista actualizada de usuarios conectados
      emitOnlineUsers();
    });

    // Unirse a una sala de chat
    socket.on('join_room', (roomId: string) => {
      if (!roomId) return;
      
      socket.join(roomId);
      console.log(`Socket ${socket.id} unido a sala ${roomId}`);
      
      // Notificar a la sala que un usuario se unió
      io.to(roomId).emit('user_joined', {
        userId: socket.data.userId,
        username: socket.data.username,
        roomId
      });
    });

    // Enviar mensaje
    socket.on('send_message', (message: Message) => {
      if (!message.roomId || !message.content) {
        console.error('Datos de mensaje incompletos');
        return;
      }
      
      // Asegurar que el mensaje tenga remitente (desde el socket si no está en el mensaje)
      const finalMessage = {
        ...message,
        senderId: message.senderId || socket.data.userId,
        senderName: message.senderName || socket.data.username || 'Usuario',
        timestamp: message.timestamp || new Date().toISOString()
      };
      
      console.log(`Mensaje enviado a sala ${finalMessage.roomId}: ${finalMessage.content.substring(0, 30)}...`);
      
      // Emitir el mensaje a todos en la sala
      io.to(finalMessage.roomId).emit('new_message', finalMessage);
    });

    // Indicar que un usuario está escribiendo
    socket.on('typing', (roomId: string) => {
      if (!socket.data.userId || !roomId) return;
      
      socket.to(roomId).emit('user_typing', {
        userId: socket.data.userId,
        username: socket.data.username,
        roomId
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
      
      const userId = socket.data.userId;
      if (userId) {
        // Eliminar este socket del mapa de usuarios conectados
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          const updatedSockets = userSockets.filter(id => id !== socket.id);
          
          if (updatedSockets.length > 0) {
            connectedUsers.set(userId, updatedSockets);
          } else {
            connectedUsers.delete(userId);
          }
        }
        
        // Emitir lista actualizada de usuarios conectados
        emitOnlineUsers();
      }
    });
  });

  console.log('Servidor Socket.IO inicializado');
};

// Emitir lista de usuarios conectados
function emitOnlineUsers() {
  const onlineUserIds = Array.from(connectedUsers.keys());
  io.emit('online_users', onlineUserIds);
}

// Obtener la instancia de Socket.IO
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};