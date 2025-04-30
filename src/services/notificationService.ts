// src/services/notificationService.ts
import NotificationModel, { INotification } from '../models/notification';
import mongoose from 'mongoose';
import { getIO } from '../config/socketConfig';

// Crear una nueva notificación
export const createNotification = async (notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
}): Promise<INotification> => {
    try {
        // Convertir el userId a ObjectId
        const userId = new mongoose.Types.ObjectId(notificationData.userId);
        
        // Crear la notificación
        const notification = new NotificationModel({
            userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data || null,
            read: false,
            createdAt: new Date()
        });
        
        const savedNotification = await notification.save();
        
        // Emitir evento de socket para notificación en tiempo real
        try {
            const io = getIO();
            io.to(`user:${notificationData.userId}`).emit('new_notification', {
                id: savedNotification._id,
                type: savedNotification.type,
                title: savedNotification.title,
                message: savedNotification.message,
                data: savedNotification.data,
                createdAt: savedNotification.createdAt
            });
        } catch (error) {
            console.error('Error al emitir notificación por Socket.IO:', error);
        }
        
        return savedNotification;
    } catch (error) {
        console.error('Error al crear notificación:', error);
        throw error;
    }
};

// Obtener notificaciones de un usuario
export const getUserNotifications = async (
    userId: string,
    options: {
        onlyUnread?: boolean;
        limit?: number;
        page?: number;
    } = {}
): Promise<{
    notifications: INotification[];
    totalCount: number;
    unreadCount: number;
}> => {
    try {
        const { onlyUnread = false, limit = 20, page = 1 } = options;
        const skip = (page - 1) * limit;
        
        // Filtro base
        const filter: any = { userId: new mongoose.Types.ObjectId(userId) };
        
        // Filtrar solo no leídas si se especifica
        if (onlyUnread) {
            filter.read = false;
        }
        
        // Contar total de notificaciones
        const totalCount = await NotificationModel.countDocuments(filter);
        
        // Contar notificaciones no leídas
        const unreadCount = await NotificationModel.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            read: false
        });
        
        // Obtener notificaciones paginadas
        const notifications = await NotificationModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        return {
            notifications,
            totalCount,
            unreadCount
        };
    } catch (error) {
        console.error('Error al obtener notificaciones de usuario:', error);
        throw error;
    }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: string): Promise<INotification | null> => {
    try {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        throw error;
    }
};

// Marcar todas las notificaciones de un usuario como leídas
export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
    try {
        const result = await NotificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), read: false },
            { read: true }
        );
        
        return result.modifiedCount;
    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        throw error;
    }
};

// Eliminar una notificación
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
        const result = await NotificationModel.deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) });
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        throw error;
    }
};

// Enviar notificación a varios usuarios (para notificaciones masivas)
export const sendBulkNotifications = async (userIds: string[], notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
}): Promise<number> => {
    try {
        const operations = userIds.map(userId => ({
            insertOne: {
                document: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data || null,
                    read: false,
                    createdAt: new Date()
                }
            }
        }));
        
        const result = await NotificationModel.bulkWrite(operations);
        
        // Notificar a todos los usuarios afectados
        try {
            const io = getIO();
            for (const userId of userIds) {
                io.to(`user:${userId}`).emit('new_notification', {
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error al emitir notificaciones masivas por Socket.IO:', error);
        }
        
        return result.insertedCount || 0;
    } catch (error) {
        console.error('Error al enviar notificaciones masivas:', error);
        throw error;
    }
};