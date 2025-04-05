import mongoose, { Schema } from "mongoose";

export const activityHistorySchema = new Schema({
  activityId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Activity', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  changeType: { 
    type: String, 
    enum: ['create', 'update', 'delete'], 
    required: true 
  },
  changedFields: { 
    type: [String], 
    default: [] 
  },
  previousValues: { 
    type: Schema.Types.Mixed 
  },
  newValues: { 
    type: Schema.Types.Mixed 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

export interface IActivityHistory {
  activityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  changeType: 'create' | 'update' | 'delete';
  changedFields?: string[];
  previousValues?: any;
  newValues?: any;
  timestamp?: Date;
}

const ActivityHistoryModel = mongoose.model('ActivityHistory', activityHistorySchema);
export default ActivityHistoryModel;