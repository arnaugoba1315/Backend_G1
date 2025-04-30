// src/models/notification.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: string; // 'challenge_completed', 'achievement_unlocked', 'friend_request', etc.
    title: string;
    message: string;
    data?: any; // Datos adicionales dependiendo del tipo de notificación
    read: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice para mejorar rendimiento de consultas
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
export default NotificationModel;