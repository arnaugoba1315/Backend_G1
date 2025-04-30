import { Request, Response } from 'express';
import * as trackingService from '../services/TrackingService';
import { SocketService } from '../services/socketService';

// Iniciar una nueva actividad
export const startActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        const { name, type, startLocation } = req.body;
        
        // Validar datos obligatorios
        if (!name || !type || !startLocation) {
            return res.status(400).json({ 
                message: 'Missing required fields: name, type, startLocation' 
            });
        }
        
        // Validar que el tipo de actividad sea válido
        const validTypes = ['running', 'cycling', 'hiking', 'walking'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                message: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` 
            });
        }
        
        // Validar ubicación inicial
        if (!startLocation.latitude || !startLocation.longitude) {
            return res.status(400).json({ 
                message: 'startLocation must include latitude and longitude' 
            });
        }
        
        // Verificar si ya hay una actividad activa para este usuario
        const activeActivity = await trackingService.getActiveActivity(userId);
        if (activeActivity) {
            return res.status(409).json({
                message: 'User already has an active activity',
                activeActivity: {
                    id: activeActivity._id,
                    name: activeActivity.name,
                    status: activeActivity.status,
                    startTime: activeActivity.startTime
                }
            });
        }
        
        // Iniciar la actividad
        const activity = await trackingService.startActivity(userId, {
            name,
            type,
            startLocation
        });
        
        return res.status(201).json({
            message: 'Activity started successfully',
            activity: {
                id: activity._id,
                name: activity.name,
                type: activity.type,
                startTime: activity.startTime,
                status: activity.status
            }
        });
    } catch (error: any) {
        console.error('Error starting activity:', error);
        return res.status(500).json({
            message: 'Error starting activity',
            error: error.message
        });
    }
};

// Actualizar la ubicación de una actividad en curso
export const updateLocationController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        const { latitude, longitude, altitude, heartRate, cadence, speed } = req.body;
        
        // Validar coordenadas
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ 
                message: 'Latitude and longitude are required' 
            });
        }
        
        // Actualizar la ubicación
        const updatedActivity = await trackingService.updateActivityLocation(
            activityId,
            userId,
            {
                latitude,
                longitude,
                altitude,
                heartRate,
                cadence,
                speed
            }
        );
        
        if (!updatedActivity) {
            return res.status(404).json({ 
                message: 'Activity not found or not active' 
            });
        }
        
        return res.status(200).json({
            message: 'Location updated successfully',
            stats: updatedActivity.realTimeStats,
            lastUpdate: updatedActivity.lastUpdateTime
        });
    } catch (error: any) {
        console.error('Error updating location:', error);
        return res.status(500).json({
            message: 'Error updating location',
            error: error.message
        });
    }
};

// Pausar una actividad en curso
export const pauseActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Pausar la actividad
        const pausedActivity = await trackingService.pauseActivity(activityId, userId);
        
        if (!pausedActivity) {
            return res.status(404).json({ 
                message: 'Activity not found or not active' 
            });
        }
        
        return res.status(200).json({
            message: 'Activity paused successfully',
            activity: {
                id: pausedActivity._id,
                name: pausedActivity.name,
                status: pausedActivity.status,
                pausedAt: pausedActivity.pausedAt
            }
        });
    } catch (error: any) {
        console.error('Error pausing activity:', error);
        return res.status(500).json({
            message: 'Error pausing activity',
            error: error.message
        });
    }
};

// Reanudar una actividad pausada
export const resumeActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Reanudar la actividad
        const resumedActivity = await trackingService.resumeActivity(activityId, userId);
        
        if (!resumedActivity) {
            return res.status(404).json({ 
                message: 'Activity not found or not paused' 
            });
        }
        
        return res.status(200).json({
            message: 'Activity resumed successfully',
            activity: {
                id: resumedActivity._id,
                name: resumedActivity.name,
                status: resumedActivity.status,
                pauseTime: resumedActivity.pauseTime
            }
        });
    } catch (error: any) {
        console.error('Error resuming activity:', error);
        return res.status(500).json({
            message: 'Error resuming activity',
            error: error.message
        });
    }
};

// Finalizar una actividad
export const finishActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Finalizar la actividad
        const finishedActivity = await trackingService.finishActivity(activityId, userId);
        
        if (!finishedActivity) {
            return res.status(404).json({ 
                message: 'Activity not found or already completed' 
            });
        }
        
        return res.status(200).json({
            message: 'Activity finished successfully',
            activity: {
                id: finishedActivity._id,
                name: finishedActivity.name,
                type: finishedActivity.type,
                startTime: finishedActivity.startTime,
                endTime: finishedActivity.endTime,
                duration: finishedActivity.duration,
                distance: finishedActivity.distance,
                elevationGain: finishedActivity.elevationGain,
                averageSpeed: finishedActivity.averageSpeed,
                status: finishedActivity.status
            }
        });
    } catch (error: any) {
        console.error('Error finishing activity:', error);
        return res.status(500).json({
            message: 'Error finishing activity',
            error: error.message
        });
    }
};

// Cancelar una actividad
export const cancelActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Cancelar la actividad
        const success = await trackingService.cancelActivity(activityId, userId);
        
        if (!success) {
            return res.status(404).json({ 
                message: 'Activity not found or already completed' 
            });
        }
        
        return res.status(200).json({
            message: 'Activity cancelled successfully'
        });
    } catch (error: any) {
        console.error('Error cancelling activity:', error);
        return res.status(500).json({
            message: 'Error cancelling activity',
            error: error.message
        });
    }
};

// Obtener la actividad activa de un usuario
export const getActiveActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId || (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        // Buscar la actividad activa
        const activeActivity = await trackingService.getActiveActivity(userId);
        
        if (!activeActivity) {
            return res.status(404).json({ 
                message: 'No active activity found for this user' 
            });
        }
        
        return res.status(200).json({
            activity: {
                id: activeActivity._id,
                name: activeActivity.name,
                type: activeActivity.type,
                startTime: activeActivity.startTime,
                status: activeActivity.status,
                realTimeStats: activeActivity.realTimeStats,
                lastUpdateTime: activeActivity.lastUpdateTime,
                pausedAt: activeActivity.pausedAt
            }
        });
    } catch (error: any) {
        console.error('Error getting active activity:', error);
        return res.status(500).json({
            message: 'Error getting active activity',
            error: error.message
        });
    }
};

// Obtener los seguidores de una actividad
export const getActivityFollowersController = async (req: Request, res: Response) => {
    try {
        const activityId = req.params.activityId;
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Obtener seguidores
        const followers = await trackingService.getActivityFollowers(activityId);
        
        return res.status(200).json({
            followers,
            count: followers.length
        });
    } catch (error: any) {
        console.error('Error getting activity followers:', error);
        return res.status(500).json({
            message: 'Error getting activity followers',
            error: error.message
        });
    }
};

// Enviar una alerta de emergencia
export const sendEmergencyAlertController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        const { latitude, longitude, message } = req.body;
        
        // Validar ubicación
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                message: 'Current location (latitude, longitude) is required' 
            });
        }
        
        // Enviar alerta
        await trackingService.sendEmergencyAlert(
            activityId,
            userId,
            { latitude, longitude },
            message
        );
        
        return res.status(200).json({
            message: 'Emergency alert sent successfully'
        });
    } catch (error: any) {
        console.error('Error sending emergency alert:', error);
        return res.status(500).json({
            message: 'Error sending emergency alert',
            error: error.message
        });
    }
};

// Unirse a seguir una actividad
export const joinActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Unir al usuario a la sala de la actividad
        SocketService.joinActivityRoom(activityId, userId);
        
        return res.status(200).json({
            message: 'Joined activity successfully'
        });
    } catch (error: any) {
        console.error('Error joining activity:', error);
        return res.status(500).json({
            message: 'Error joining activity',
            error: error.message
        });
    }
};

// Dejar de seguir una actividad
export const leaveActivityController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        // Hacer que el usuario abandone la sala de la actividad
        SocketService.leaveActivityRoom(activityId, userId);
        
        return res.status(200).json({
            message: 'Left activity successfully'
        });
    } catch (error: any) {
        console.error('Error leaving activity:', error);
        return res.status(500).json({
            message: 'Error leaving activity',
            error: error.message
        });
    }
};

// Enviar un mensaje a los seguidores de una actividad
export const sendMessageToFollowersController = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || (req as any).user?.id;
        const activityId = req.params.activityId;
        const { message } = req.body;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID is required' });
        }
        
        if (!activityId) {
            return res.status(400).json({ message: 'Activity ID is required' });
        }
        
        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }
        
        // Enviar mensaje a través de Socket.IO
        SocketService.sendMessageToFollowers(activityId, message, userId);
        
        return res.status(200).json({
            message: 'Message sent successfully'
        });
    } catch (error: any) {
        console.error('Error sending message to followers:', error);
        return res.status(500).json({
            message: 'Error sending message to followers',
            error: error.message
        });
    }
};