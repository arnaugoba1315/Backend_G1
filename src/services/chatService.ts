import ChatRoomModel, { IChatRoom } from '../models/chatRoom';
import MessageModel, { IMessage } from '../models/message';
import mongoose from 'mongoose';

// Crear una sala de chat
export const createChatRoom = async (roomData: {
  name: string;
  description?: string;
  participants: string[];
}): Promise<IChatRoom> => {
  const participantIds = roomData.participants.map(id => new mongoose.Types.ObjectId(id));
  
  // Verificar si ya existe una sala con los mismos participantes (para chats privados)
  if (participantIds.length === 2) {
    const existingRoom = await ChatRoomModel.findOne({
      participants: { $all: participantIds, $size: 2 }
    });
    
    if (existingRoom) {
      return existingRoom;
    }
  }
  
  const chatRoom = new ChatRoomModel({
    name: roomData.name,
    description: roomData.description,
    participants: participantIds,
    createdAt: new Date()
  });
  
  return await chatRoom.save();
};

// Obtener salas de chat para un usuario
export const getChatRoomsForUser = async (userId: string): Promise<IChatRoom[]> => {
  return await ChatRoomModel.find({ 
    participants: new mongoose.Types.ObjectId(userId) 
  })
  .populate('participants', 'username profilePicture')
  .sort({ lastMessageTime: -1 });
};

// Obtener detalles de una sala de chat
export const getChatRoomById = async (roomId: string): Promise<IChatRoom | null> => {
  return await ChatRoomModel.findById(roomId)
    .populate('participants', 'username profilePicture');
};

// Guardar un mensaje
export const saveMessage = async (messageData: {
  roomId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}): Promise<IMessage> => {
  // Crear mensaje
  const message = new MessageModel({
    roomId: new mongoose.Types.ObjectId(messageData.roomId),
    senderId: new mongoose.Types.ObjectId(messageData.senderId),
    content: messageData.content,
    timestamp: messageData.timestamp
  });
  
  const savedMessage = await message.save();
  
  // Actualizar la sala de chat con el último mensaje
  await ChatRoomModel.findByIdAndUpdate(
    messageData.roomId,
    { 
      lastMessage: messageData.content,
      lastMessageTime: messageData.timestamp
    }
  );
  
  // Poblar la información del remitente
  const populatedMessage = await MessageModel.findById(savedMessage._id)
    .populate('senderId', 'username profilePicture');
  
  if (!populatedMessage) {
    throw new Error('Message not found after saving');
  }

  return populatedMessage;
};

// Obtener mensajes para una sala
export const getMessagesForRoom = async (roomId: string, limit: number = 50): Promise<IMessage[]> => {
  return await MessageModel.find({ roomId: new mongoose.Types.ObjectId(roomId) })
    .populate('senderId', 'username profilePicture')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<number> => {
  const result = await MessageModel.updateMany(
    { 
      roomId: new mongoose.Types.ObjectId(roomId),
      senderId: { $ne: new mongoose.Types.ObjectId(userId) },
      read: false
    },
    { read: true }
  );
  
  return result.modifiedCount;
};

// Eliminar una sala de chat
export const deleteChatRoom = async (roomId: string): Promise<boolean> => {
  const result = await ChatRoomModel.deleteOne({ _id: new mongoose.Types.ObjectId(roomId) });
  
  // También eliminar todos los mensajes asociados
  await MessageModel.deleteMany({ roomId: new mongoose.Types.ObjectId(roomId) });
  
  return result.deletedCount > 0;
};