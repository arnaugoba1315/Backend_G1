// src/controllers/notificationController.ts
import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

// Obtener notificaciones del usuario
export const getUserNotificationsController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const onlyUnread = req.query.unread === 'true';
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        
        const result = await notificationService.getUserNotifications(userId, {
            onlyUnread,
            limit,
            page
        });
        
        res.status(200).json({
            notifications: result.notifications,
            total: result.totalCount,
            unread: result.unreadCount,
            page,
            limit
        });
    } catch (error: any) {
        console.error('Error al obtener notificaciones del usuario:', error);
        res.status(500).json({ message: error.message });
    }
};

// Crear una notificación
export const createNotificationController = async (req: Request, res: Response) => {
    try {
        const { userId, type, title, message, data } = req.body;
        
        if (!userId || !type || !title || !message) {
            return res.status(400).json({ 
                message: 'Se requieren userId, type, title y message' 
            });
        }
        
        const notification = await notificationService.createNotification({
            userId,
            type,
            title,
            message,
            data
        });
        
        res.status(201).json(notification);
    } catch (error: any) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ message: error.message });
    }
};

// Marcar notificación como leída
export const markNotificationAsReadController = async (req: Request, res: Response) => {
    try {
        const notificationId = req.params.id;
        
        const notification = await notificationService.markNotificationAsRead(notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        res.status(200).json(notification);
    } catch (error: any) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ message: error.message });
    }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsReadController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        
        const updatedCount = await notificationService.markAllNotificationsAsRead(userId);
        
        res.status(200).json({ 
            message: `${updatedCount} notificaciones marcadas como leídas`,
            count: updatedCount 
        });
    } catch (error: any) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        res.status(500).json({ message: error.message });
    }
};

// Eliminar notificación
export const deleteNotificationController = async (req: Request, res: Response) => {
    try {
        const notificationId = req.params.id;
        
        const success = await notificationService.deleteNotification(notificationId);
        
        if (!success) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        res.status(200).json({ message: 'Notificación eliminada correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ message: error.message });
    }
};

// Enviar notificación a múltiples usuarios
export const sendBulkNotificationsController = async (req: Request, res: Response) => {
    try {
        const { userIds, type, title, message, data } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !type || !title || !message) {
            return res.status(400).json({ 
                message: 'Se requieren userIds (array), type, title y message' 
            });
        }
        
        const count = await notificationService.sendBulkNotifications(userIds, {
            type,
            title,
            message,
            data
        });
        
        res.status(201).json({ 
            message: `${count} notificaciones enviadas correctamente`,
            count 
        });
    } catch (error: any) {
        console.error('Error al enviar notificaciones masivas:', error);
        res.status(500).json({ message: error.message });
    }
};