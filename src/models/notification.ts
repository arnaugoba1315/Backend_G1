import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  content: string;
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;
  timestamp: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['achievement', 'challenge', 'activity', 'message', 'friend', 'system']
  },
  content: {
    type: String,
    required: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
export default NotificationModel;