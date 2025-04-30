import { getIO } from '../config/socketConfig';
import { IActivity, ITrackPoint, IRealTimeStats } from '../models/activity';
import mongoose from 'mongoose';

/**
 * Servicio para gestionar la comunicación en tiempo real mediante Socket.IO
 * relacionada con el seguimiento de actividades
 */
export class SocketService {
    /**
     * Notifica que se ha iniciado una nueva actividad
     */
    static notifyActivityStarted(activity: IActivity): void {
        try {
            const io = getIO();
            const activityId = activity._id?.toString();
            const userId = activity.author.toString();

            if (!activityId) {
                console.error('No se pudo notificar inicio de actividad: ID de actividad no disponible');
                return;
            }

            // Notificar al usuario que inició la actividad
            io.to(`user:${userId}`).emit('activity_started', {
                activityId,
                name: activity.name,
                type: activity.type,
                startTime: activity.startTime,
                status: activity.status
            });

            // Crear una sala específica para esta actividad
            io.socketsJoin(`activity:${activityId}`);

            console.log(`Sala de actividad creada: activity:${activityId}`);
        } catch (error) {
            console.error('Error al notificar inicio de actividad:', error);
        }
    }

    /**
     * Notifica una actualización de ubicación en tiempo real
     */
    static notifyLocationUpdate(
        activityId: string, 
        newPoint: ITrackPoint, 
        stats: IRealTimeStats | undefined
    ): void {
        try {
            const io = getIO();
            
            // Enviar actualización a todos los que están siguiendo la actividad
            io.to(`activity:${activityId}`).emit('location_update', {
                activityId,
                trackPoint: {
                    latitude: newPoint.latitude,
                    longitude: newPoint.longitude,
                    altitude: newPoint.altitude,
                    timestamp: newPoint.timestamp,
                    heartRate: newPoint.heartRate,
                    cadence: newPoint.cadence,
                    speed: newPoint.speed
                },
                stats: stats ? {
                    currentSpeed: stats.currentSpeed,
                    currentPace: stats.currentPace,
                    elapsedTime: stats.elapsedTime,
                    elapsedDistance: stats.elapsedDistance,
                    currentHeartRate: stats.currentHeartRate,
                    currentCadence: stats.currentCadence,
                    caloriesBurned: stats.caloriesBurned
                } : null
            });
        } catch (error) {
            console.error('Error al notificar actualización de ubicación:', error);
        }
    }

    /**
     * Notifica que una actividad ha sido pausada
     */
    static notifyActivityPaused(activityId: string, userId: string, pausedAt: Date): void {
        try {
            const io = getIO();
            
            // Notificar a todos los que están siguiendo la actividad
            io.to(`activity:${activityId}`).emit('activity_paused', {
                activityId,
                userId,
                pausedAt,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error al notificar pausa de actividad:', error);
        }
    }

    /**
     * Notifica que una actividad pausada ha sido reanudada
     */
    static notifyActivityResumed(activityId: string, userId: string, totalPauseTime: number): void {
        try {
            const io = getIO();
            
            // Notificar a todos los que están siguiendo la actividad
            io.to(`activity:${activityId}`).emit('activity_resumed', {
                activityId,
                userId,
                totalPauseTime,
                resumedAt: new Date()
            });
        } catch (error) {
            console.error('Error al notificar reanudación de actividad:', error);
        }
    }

    /**
     * Notifica que una actividad ha sido finalizada
     */
    static notifyActivityFinished(activity: IActivity): void {
        try {
            const io = getIO();
            const activityId = activity._id?.toString();
            const userId = activity.author.toString();
            
            if (!activityId) {
                console.error('No se pudo notificar finalización de actividad: ID de actividad no disponible');
                return;
            }
            
            // Notificar a todos los que están siguiendo la actividad
            io.to(`activity:${activityId}`).emit('activity_finished', {
                activityId,
                userId,
                stats: {
                    distance: activity.distance,
                    duration: activity.duration,
                    elevationGain: activity.elevationGain,
                    averageSpeed: activity.averageSpeed,
                    caloriesBurned: activity.caloriesBurned
                },
                endTime: activity.endTime,
                timestamp: new Date()
            });
            
            // Remover la sala después de un tiempo
            setTimeout(() => {
                io.in(`activity:${activityId}`).socketsLeave(`activity:${activityId}`);
                console.log(`Sala de actividad eliminada: activity:${activityId}`);
            }, 5000); // Dar tiempo para que todos reciban la notificación
        } catch (error) {
            console.error('Error al notificar finalización de actividad:', error);
        }
    }

    /**
     * Notifica que una actividad ha sido cancelada
     */
    static notifyActivityCancelled(activityId: string, userId: string): void {
        try {
            const io = getIO();
            
            // Notificar a todos los que están siguiendo la actividad
            io.to(`activity:${activityId}`).emit('activity_cancelled', {
                activityId,
                userId,
                timestamp: new Date()
            });
            
            // Remover la sala inmediatamente
            io.in(`activity:${activityId}`).socketsLeave(`activity:${activityId}`);
            console.log(`Sala de actividad eliminada por cancelación: activity:${activityId}`);
        } catch (error) {
            console.error('Error al notificar cancelación de actividad:', error);
        }
    }

    /**
     * Permite a un usuario unirse a seguir una actividad en vivo
     */
    static joinActivityRoom(activityId: string, userId: string): void {
        try {
            const io = getIO();
            
            // Buscar sockets asociados con este usuario
            const sockets = io.sockets.sockets;
            let found = false;
            
            for (const [socketId, socket] of sockets.entries()) {
                if (socket.data && socket.data.userId === userId) {
                    // Unir este socket a la sala de la actividad
                    socket.join(`activity:${activityId}`);
                    found = true;
                    console.log(`Usuario ${userId} unido a sala de actividad: ${activityId}`);
                    
                    // Notificar al propietario de la actividad que un nuevo usuario está siguiendo
                    socket.to(`activity:${activityId}`).emit('follower_joined', {
                        activityId,
                        userId,
                        username: socket.data.username || 'Usuario'
                    });
                }
            }
            
            if (!found) {
                console.log(`No se encontraron sockets para el usuario ${userId}`);
            }
        } catch (error) {
            console.error('Error al unirse a sala de actividad:', error);
        }
    }

    /**
     * Permite a un usuario dejar de seguir una actividad en vivo
     */
    static leaveActivityRoom(activityId: string, userId: string): void {
        try {
            const io = getIO();
            
            // Buscar sockets asociados con este usuario
            const sockets = io.sockets.sockets;
            
            for (const [socketId, socket] of sockets.entries()) {
                if (socket.data && socket.data.userId === userId) {
                    // Hacer que este socket abandone la sala de la actividad
                    socket.leave(`activity:${activityId}`);
                    console.log(`Usuario ${userId} abandonó sala de actividad: ${activityId}`);
                    
                    // Notificar al propietario de la actividad que un usuario dejó de seguir
                    socket.to(`activity:${activityId}`).emit('follower_left', {
                        activityId,
                        userId,
                        username: socket.data.username || 'Usuario'
                    });
                }
            }
        } catch (error) {
            console.error('Error al abandonar sala de actividad:', error);
        }
    }

    /**
     * Obtiene la lista de usuarios que están siguiendo una actividad
     */
    static async getActivityFollowers(activityId: string): Promise<{ userId: string, username: string }[]> {
        try {
            const io = getIO();
            const followers: { userId: string, username: string }[] = [];
            
            // Obtener sockets en la sala de la actividad
            const sockets = await io.in(`activity:${activityId}`).fetchSockets();
            
            for (const socket of sockets) {
                if (socket.data && socket.data.userId) {
                    followers.push({
                        userId: socket.data.userId,
                        username: socket.data.username || 'Usuario'
                    });
                }
            }
            
            return followers;
        } catch (error) {
            console.error('Error al obtener seguidores de actividad:', error);
            return [];
        }
    }

    /**
     * Enviar un mensaje a todos los seguidores de una actividad
     */
    static sendMessageToFollowers(activityId: string, message: string, senderId: string = 'system'): void {
        try {
            const io = getIO();
            
            io.to(`activity:${activityId}`).emit('activity_message', {
                activityId,
                senderId,
                message,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error al enviar mensaje a seguidores:', error);
        }
    }

    /**
     * Enviar una alerta de emergencia a todos los seguidores de una actividad
     */
    static sendEmergencyAlert(activityId: string, userId: string, location: { latitude: number, longitude: number }): void {
        try {
            const io = getIO();
            
            io.to(`activity:${activityId}`).emit('emergency_alert', {
                activityId,
                userId,
                location,
                timestamp: new Date()
            });
            
            // También podríamos enviar notificaciones push aquí o usar otros canales de comunicación
            console.log(`Alerta de emergencia enviada para actividad ${activityId} en ubicación: ${JSON.stringify(location)}`);
        } catch (error) {
            console.error('Error al enviar alerta de emergencia:', error);
        }
    }

    /**
     * Emite eventos de métricas periódicas
     */
    static broadcastActivityMetrics(activityId: string, metrics: any): void {
        try {
            const io = getIO();
            
            io.to(`activity:${activityId}`).emit('activity_metrics', {
                activityId,
                metrics,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error al emitir métricas de actividad:', error);
        }
    }

    /**
     * Notifica cuando un usuario alcanza un hito durante la actividad
     */
    static notifyMilestone(activityId: string, userId: string, milestone: {
        type: 'distance' | 'duration' | 'elevation' | 'custom',
        value: number,
        unit: string,
        message: string
    }): void {
        try {
            const io = getIO();
            
            io.to(`activity:${activityId}`).emit('milestone_reached', {
                activityId,
                userId,
                milestone,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error al notificar hito alcanzado:', error);
        }
    }
}