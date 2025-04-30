import ActivityModel, { IActivity, ITrackPoint } from "../models/activity";
import UserModel from "../models/user";
import mongoose from "mongoose";
import { SocketService } from './socketService';

// Iniciar una nueva actividad en tiempo real
export const startActivity = async (
    userId: string,
    activityData: {
        name: string;
        type: "running" | "cycling" | "hiking" | "walking";
        startLocation: { latitude: number; longitude: number; altitude?: number };
    }
): Promise<IActivity> => {
    try {
        const now = new Date();
        
        // Comprobar si el usuario tiene una actividad activa
        const activeActivity = await ActivityModel.findOne({
            author: new mongoose.Types.ObjectId(userId),
            status: { $in: ["active", "paused"] }
        });
        
        if (activeActivity) {
            throw new Error("User already has an active activity. Complete or cancel it before starting a new one.");
        }
        
        // Crear el punto inicial de seguimiento
        const initialTrackPoint: ITrackPoint = {
            latitude: activityData.startLocation.latitude,
            longitude: activityData.startLocation.longitude,
            altitude: activityData.startLocation.altitude || 0,
            timestamp: now
        };
        
        // Crear una nueva actividad
        const newActivity = new ActivityModel({
            author: new mongoose.Types.ObjectId(userId),
            name: activityData.name,
            type: activityData.type,
            startTime: now,
            endTime: now, // Se actualizará al finalizar
            duration: 0,
            distance: 0,
            elevationGain: 0,
            averageSpeed: 0,
            route: [], // Se irán añadiendo puntos de referencia
            status: "active",
            trackPoints: [initialTrackPoint],
            lastUpdateTime: now,
            realTimeStats: {
                currentSpeed: 0,
                currentPace: 0,
                elapsedTime: 0,
                elapsedDistance: 0,
                caloriesBurned: 0,
                lastUpdate: now
            }
        });
        
        const savedActivity = await newActivity.save();
        
        // Notificar a través de Socket.IO que se ha iniciado una actividad
        SocketService.notifyActivityStarted(savedActivity);
        
        return savedActivity;
    } catch (error) {
        console.error('Error al iniciar actividad:', error);
        throw error;
    }
};

// Actualizar la posición de una actividad en curso
export const updateActivityLocation = async (
    activityId: string,
    userId: string,
    trackPoint: {
        latitude: number;
        longitude: number;
        altitude?: number;
        heartRate?: number;
        cadence?: number;
        speed?: number;
    }
): Promise<IActivity | null> => {
    try {
        // Buscar la actividad y verificar que pertenece al usuario y está activa
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            author: new mongoose.Types.ObjectId(userId),
            status: "active"
        });
        
        if (!activity) {
            throw new Error("Activity not found or not active");
        }
        
        const now = new Date();
        
        // Crear el nuevo punto de seguimiento
        const newTrackPoint: ITrackPoint = {
            latitude: trackPoint.latitude,
            longitude: trackPoint.longitude,
            altitude: trackPoint.altitude || 0,
            timestamp: now,
            heartRate: trackPoint.heartRate,
            cadence: trackPoint.cadence,
            speed: trackPoint.speed
        };
        
        // Calcular estadísticas en tiempo real
        const lastPoint = activity.trackPoints && activity.trackPoints.length > 0 
            ? activity.trackPoints[activity.trackPoints.length - 1] 
            : null;
            
        let distance = 0;
        let speed = 0;
        let pace = 0;
        let elapsedTimeSeconds = 0;
        let caloriesBurned = activity.realTimeStats?.caloriesBurned || 0;
        
        if (lastPoint) {
            // Calcular distancia entre el último punto y el nuevo
            distance = calculateDistance(
                lastPoint.latitude, 
                lastPoint.longitude, 
                newTrackPoint.latitude, 
                newTrackPoint.longitude
            );
            
            // Calcular tiempo transcurrido desde el último punto en segundos
            const timeDiff = (now.getTime() - lastPoint.timestamp.getTime()) / 1000;
            
            // Calcular velocidad en metros por segundo
            speed = timeDiff > 0 ? distance / timeDiff : 0;
            
            // Calcular ritmo (minutos por kilómetro)
            pace = speed > 0 ? (1000 / speed) / 60 : 0;
            
            // Tiempo total transcurrido desde el inicio
            elapsedTimeSeconds = (now.getTime() - activity.startTime.getTime()) / 1000;
            if (activity.pauseTime) {
                elapsedTimeSeconds -= activity.pauseTime;
            }

            // Estimar calorías quemadas (fórmula simplificada)
            const MET = getMetValue(activity.type, speed);
            const userWeight = 70; // Peso por defecto en kg (idealmente se obtendría del perfil)
            // Calorías = MET * peso en kg * tiempo en horas
            const additionalCalories = MET * userWeight * (timeDiff / 3600);
            caloriesBurned += additionalCalories;
        }
        
        // Actualizar la actividad con el nuevo punto de seguimiento y estadísticas
        const updatedActivity = await ActivityModel.findByIdAndUpdate(
            activityId,
            {
                $push: { trackPoints: newTrackPoint },
                $set: {
                    lastUpdateTime: now,
                    'realTimeStats.currentSpeed': speed,
                    'realTimeStats.currentPace': pace,
                    'realTimeStats.currentHeartRate': trackPoint.heartRate,
                    'realTimeStats.currentCadence': trackPoint.cadence,
                    'realTimeStats.elapsedTime': elapsedTimeSeconds,
                    'realTimeStats.elapsedDistance': (activity.realTimeStats?.elapsedDistance || 0) + distance,
                    'realTimeStats.caloriesBurned': caloriesBurned,
                    'realTimeStats.lastUpdate': now
                }
            },
            { new: true }
        );
        
        // Notificar la actualización a través de Socket.IO
        if (updatedActivity) {
            SocketService.notifyLocationUpdate(
                activityId, 
                newTrackPoint, 
                updatedActivity.realTimeStats
            );
            
            // Comprobar si se ha alcanzado algún hito
            checkMilestones(updatedActivity, activityId, userId);
        }
        
        return updatedActivity;
    } catch (error) {
        console.error('Error al actualizar ubicación de actividad:', error);
        throw error;
    }
};

// Comprobar si se han alcanzado hitos notables
function checkMilestones(activity: IActivity, activityId: string, userId: string) {
    if (!activity.realTimeStats) return;
    
    const distance = activity.realTimeStats.elapsedDistance;
    const duration = activity.realTimeStats.elapsedTime;
    
    // Hitos de distancia (cada km completo)
    const distanceKm = Math.floor(distance / 1000);
    if (distanceKm > 0 && distance - (distanceKm * 1000) < 100) { // Si acaba de pasar un km (margen de 100m)
        SocketService.notifyMilestone(activityId, userId, {
            type: 'distance',
            value: distanceKm,
            unit: 'km',
            message: `¡Has recorrido ${distanceKm} km!`
        });
    }
    
    // Hitos de tiempo (cada 10 minutos completos)
    const durationMinutes = Math.floor(duration / 60);
    if (durationMinutes > 0 && durationMinutes % 10 === 0 && 
        duration - (durationMinutes * 60) < 30) { // Si acaba de pasar 10min (margen de 30s)
        SocketService.notifyMilestone(activityId, userId, {
            type: 'duration',
            value: durationMinutes,
            unit: 'minutos',
            message: `¡Llevas ${durationMinutes} minutos de actividad!`
        });
    }
}

// Pausar una actividad en curso
export const pauseActivity = async (
    activityId: string,
    userId: string
): Promise<IActivity | null> => {
    try {
        const now = new Date();
        
        // Buscar la actividad y verificar que pertenece al usuario y está activa
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            author: new mongoose.Types.ObjectId(userId),
            status: "active"
        });
        
        if (!activity) {
            throw new Error("Activity not found or not active");
        }
        
        // Actualizar el estado de la actividad a pausada
        const updatedActivity = await ActivityModel.findByIdAndUpdate(
            activityId,
            {
                $set: {
                    status: "paused",
                    pausedAt: now
                }
            },
            { new: true }
        );
        
        // Notificar a través de Socket.IO que se ha pausado la actividad
        if (updatedActivity) {
            SocketService.notifyActivityPaused(activityId, userId, now);
            
            // Enviar mensaje informativo a seguidores
            SocketService.sendMessageToFollowers(
                activityId, 
                `${updatedActivity.name} ha sido pausada temporalmente.`
            );
        }
        
        return updatedActivity;
    } catch (error) {
        console.error('Error al pausar actividad:', error);
        throw error;
    }
};

// Reanudar una actividad pausada
export const resumeActivity = async (
    activityId: string,
    userId: string
): Promise<IActivity | null> => {
    try {
        const now = new Date();
        
        // Buscar la actividad y verificar que pertenece al usuario y está pausada
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            author: new mongoose.Types.ObjectId(userId),
            status: "paused"
        });
        
        if (!activity) {
            throw new Error("Activity not found or not paused");
        }
        
        // Calcular tiempo adicional en pausa
        let additionalPauseTime = 0;
        if (activity.pausedAt) {
            additionalPauseTime = (now.getTime() - activity.pausedAt.getTime()) / 1000;
        }
        
        const totalPauseTime = (activity.pauseTime || 0) + additionalPauseTime;
        
        // Actualizar el estado de la actividad a activa
        const updatedActivity = await ActivityModel.findByIdAndUpdate(
            activityId,
            {
                $set: {
                    status: "active",
                    pauseTime: totalPauseTime,
                    pausedAt: null
                }
            },
            { new: true }
        );
        
        // Notificar a través de Socket.IO que se ha reanudado la actividad
        if (updatedActivity) {
            SocketService.notifyActivityResumed(activityId, userId, totalPauseTime);
            
            // Enviar mensaje informativo a seguidores
            SocketService.sendMessageToFollowers(
                activityId, 
                `${updatedActivity.name} ha sido reanudada.`
            );
        }
        
        return updatedActivity;
    } catch (error) {
        console.error('Error al reanudar actividad:', error);
        throw error;
    }
};

// Finalizar una actividad en curso o pausada
export const finishActivity = async (
    activityId: string,
    userId: string
): Promise<IActivity | null> => {
    try {
        const now = new Date();
        
        // Buscar la actividad y verificar que pertenece al usuario y está activa o pausada
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            author: new mongoose.Types.ObjectId(userId),
            status: { $in: ["active", "paused"] }
        });
        
        if (!activity) {
            throw new Error("Activity not found or already completed");
        }
        
        // Calcular estadísticas finales
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalDurationSeconds = 0;
        
        // Calcular distancia total y desnivel
        if (activity.trackPoints && activity.trackPoints.length > 1) {
            for (let i = 1; i < activity.trackPoints.length; i++) {
                const prevPoint = activity.trackPoints[i-1];
                const currPoint = activity.trackPoints[i];
                
                // Distancia entre puntos
                const segmentDistance = calculateDistance(
                    prevPoint.latitude,
                    prevPoint.longitude,
                    currPoint.latitude,
                    currPoint.longitude
                );
                
                totalDistance += segmentDistance;
                
                // Calcular desnivel positivo
                if (currPoint.altitude && prevPoint.altitude && currPoint.altitude > prevPoint.altitude) {
                    totalElevationGain += (currPoint.altitude - prevPoint.altitude);
                }
            }
        }
        
        // Usar la distancia calculada de los puntos de seguimiento o la de estadísticas en tiempo real (la mayor)
        totalDistance = Math.max(totalDistance, activity.realTimeStats?.elapsedDistance || 0);
        
        // Calcular duración total
        totalDurationSeconds = (now.getTime() - activity.startTime.getTime()) / 1000;
        
        // Restar tiempo en pausa
        let totalPauseTime = activity.pauseTime || 0;
        if (activity.status === "paused" && activity.pausedAt) {
            totalPauseTime += (now.getTime() - activity.pausedAt.getTime()) / 1000;
        }
        
        totalDurationSeconds -= totalPauseTime;
        
        // Calcular velocidad media
        const averageSpeed = totalDurationSeconds > 0 ? 
            (totalDistance / totalDurationSeconds) : 0;
        
        // Actualizar la actividad con las estadísticas finales
        const updatedActivity = await ActivityModel.findByIdAndUpdate(
            activityId,
            {
                $set: {
                    status: "completed",
                    endTime: now,
                    duration: Math.round(totalDurationSeconds / 60), // Convertir a minutos
                    distance: totalDistance,
                    elevationGain: totalElevationGain,
                    averageSpeed: averageSpeed,
                    // Mantener caloriesBurned si ya está calculado, o usar un valor por defecto
                    caloriesBurned: activity.caloriesBurned || activity.realTimeStats?.caloriesBurned || 0
                }
            },
            { new: true }
        );
        
        // Actualizar estadísticas del usuario
        if (updatedActivity) {
            await UserModel.findByIdAndUpdate(
                userId,
                {
                    $inc: {
                        totalDistance: totalDistance,
                        totalTime: Math.round(totalDurationSeconds / 60)
                    }
                }
            );
            
            // Notificar a través de Socket.IO que se ha finalizado la actividad
            SocketService.notifyActivityFinished(updatedActivity);
            
            // Enviar mensaje informativo a seguidores
            SocketService.sendMessageToFollowers(
                activityId, 
                `${updatedActivity.name} ha finalizado. Distancia total: ${(totalDistance / 1000).toFixed(2)} km, Tiempo: ${formatTime(totalDurationSeconds)}`
            );
        }
        
        return updatedActivity;
    } catch (error) {
        console.error('Error al finalizar actividad:', error);
        throw error;
    }
};

// Formatear tiempo en segundos a formato legible
function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
        return `${minutes}m ${remainingSeconds}s`;
    }
}

// Cancelar una actividad en curso
export const cancelActivity = async (
    activityId: string,
    userId: string
): Promise<boolean> => {
    try {
        // Buscar la actividad y verificar que pertenece al usuario y está activa o pausada
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            author: new mongoose.Types.ObjectId(userId),
            status: { $in: ["active", "paused"] }
        });
        
        if (!activity) {
            throw new Error("Activity not found or already completed");
        }
        
        // Notificar a través de Socket.IO que se ha cancelado la actividad (antes de eliminarla)
        SocketService.notifyActivityCancelled(activityId, userId);
        
        // Eliminar la actividad
        await ActivityModel.findByIdAndDelete(activityId);
        
        return true;
    } catch (error) {
        console.error('Error al cancelar actividad:', error);
        throw error;
    }
};

// Obtener una actividad en curso
export const getActiveActivity = async (userId: string): Promise<IActivity | null> => {
    try {
        return await ActivityModel.findOne({
            author: new mongoose.Types.ObjectId(userId),
            status: { $in: ["active", "paused"] }
        });
    } catch (error) {
        console.error('Error al obtener actividad activa:', error);
        throw error;
    }
};

// Obtener seguidores de una actividad
export const getActivityFollowers = async (activityId: string): Promise<{ userId: string, username: string }[]> => {
    try {
        return await SocketService.getActivityFollowers(activityId);
    } catch (error) {
        console.error('Error al obtener seguidores de actividad:', error);
        return [];
    }
};

// Enviar una alerta de emergencia
export const sendEmergencyAlert = async (
    activityId: string,
    userId: string,
    location: { latitude: number, longitude: number },
    message?: string
): Promise<boolean> => {
    try {
        // Verificar que el usuario pertenece a la actividad
        const activity = await ActivityModel.findOne({
            _id: new mongoose.Types.ObjectId(activityId),
            $or: [
                { author: new mongoose.Types.ObjectId(userId) },
                // Idealmente aquí verificaríamos también si es un seguidor, pero eso requeriría
                // integración con el sistema de seguidores que hemos implementado en Socket.IO
            ]
        });
        
        if (!activity) {
            throw new Error("Activity not found or user not authorized");
        }
        
        // Enviar alerta a través de Socket.IO
        SocketService.sendEmergencyAlert(activityId, userId, location);
        
        // Aquí podrías implementar notificaciones adicionales como SMS, correos, etc.
        console.log(`Alerta de emergencia enviada para actividad ${activityId} por usuario ${userId}`);
        
        return true;
    } catch (error) {
        console.error('Error al enviar alerta de emergencia:', error);
        throw error;
    }
};

// Función auxiliar para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180; // latitud 1 en radianes
    const φ2 = lat2 * Math.PI / 180; // latitud 2 en radianes
    const Δφ = (lat2 - lat1) * Math.PI / 180; // diferencia de latitudes en radianes
    const Δλ = (lon2 - lon1) * Math.PI / 180; // diferencia de longitudes en radianes

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

// Función para obtener el valor MET (Metabolic Equivalent of Task) según la actividad y velocidad
function getMetValue(activityType: string, speed: number): number {
    // Velocidad en km/h para facilitar la comparación
    const speedKmh = speed * 3.6;
    
    switch (activityType) {
        case 'running':
            if (speedKmh < 8) return 7; // Jogging lento
            if (speedKmh < 11) return 10; // Correr ritmo moderado
            if (speedKmh < 14) return 12.5; // Correr ritmo rápido
            return 14; // Correr sprint
            
        case 'cycling':
            if (speedKmh < 16) return 4; // Ciclismo ligero
            if (speedKmh < 20) return 6; // Ciclismo moderado
            if (speedKmh < 25) return 8; // Ciclismo vigoroso
            return 10; // Ciclismo muy rápido
            
        case 'hiking':
            if (speedKmh < 3) return 3.5; // Senderismo suave
            if (speedKmh < 5) return 5.3; // Senderismo moderado
            return 7; // Senderismo intenso
            
        case 'walking':
            if (speedKmh < 4) return 2.5; // Caminar ritmo lento
            if (speedKmh < 6) return 3.5; // Caminar ritmo moderado
            return 5; // Caminar rápido
            
        default:
            return 5; // Valor por defecto
    }
}