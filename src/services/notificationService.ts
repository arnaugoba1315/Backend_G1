import NotificationModel, { INotification } from '../models/notification';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { sendNotificationToUser } from '../config/socketConfig';

// Variable para mantener referencia al servidor de Socket.IO
let ioInstance: Server | null = null;

// Establecer la instancia de IO (llamar desde index.ts)
export const setIOInstance = (io: Server) => {
  ioInstance = io;
};

// Crear una notificación
export const createNotification = async (notificationData: {
  userId: string;
  type: string;
  content: string;
  relatedId?: string;
}): Promise<INotification> => {
  const notification = new NotificationModel({
    userId: new mongoose.Types.ObjectId(notificationData.userId),
    type: notificationData.type,
    content: notificationData.content,
    relatedId: notificationData.relatedId ? new mongoose.Types.ObjectId(notificationData.relatedId) : undefined,
    isRead: false,
    timestamp: new Date()
  });
  
  const savedNotification = await notification.save();
  
  // Enviar notificación a través de Socket.IO si el usuario está conectado
  if (ioInstance) {
    sendNotificationToUser(ioInstance, notificationData.userId, {
      id: savedNotification._id,
      type: notificationData.type,
      content: notificationData.content,
      relatedId: notificationData.relatedId,
      timestamp: new Date()
    });
  }
  
  return savedNotification;
};

// Obtener notificaciones para un usuario
export const getNotificationsForUser = async (userId: string, limit: number = 20, onlyUnread: boolean = false): Promise<INotification[]> => {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (onlyUnread) {
    query.isRead = false;
  }
  
  return await NotificationModel.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: string): Promise<INotification | null> => {
  return await NotificationModel.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const result = await NotificationModel.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), isRead: false },
    { isRead: true }
  );
  
  return result.modifiedCount;
};

// Eliminar una notificación
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const result = await NotificationModel.deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) });
  return result.deletedCount > 0;
};

// Eliminar todas las notificaciones de un usuario
export const deleteAllNotifications = async (userId: string): Promise<number> => {
  const result = await NotificationModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  return result.deletedCount;
};

// Verificar si existe una notificación similar
export const existsSimilarNotification = async (userId: string, type: string, relatedId?: string): Promise<boolean> => {
  const query: any = { 
    userId: new mongoose.Types.ObjectId(userId),
    type: type,
    isRead: false
  };
  
  if (relatedId) {
    query.relatedId = new mongoose.Types.ObjectId(relatedId);
  }
  
  const count = await NotificationModel.countDocuments(query);
  return count > 0;
};