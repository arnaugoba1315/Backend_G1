import mongoose, {Schema, model, Types} from "mongoose"

// Esquema para puntos de seguimiento (nuevo)
const trackPointSchema = new Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    altitude: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    heartRate: {
        type: Number,
        default: null
    },
    cadence: {
        type: Number,
        default: null
    },
    speed: {
        type: Number,
        default: null
    }
});

// Esquema para estadísticas en tiempo real (nuevo)
const realTimeStatsSchema = new Schema({
    currentSpeed: {
        type: Number,
        default: 0
    },
    currentPace: {
        type: Number,
        default: 0
    },
    currentHeartRate: {
        type: Number,
        default: null
    },
    currentCadence: {
        type: Number,
        default: null
    },
    elapsedTime: {
        type: Number,
        default: 0
    },
    elapsedDistance: {
        type: Number,
        default: 0
    },
    caloriesBurned: {
        type: Number,
        default: 0
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    }
});

export const activitySchema = new Schema<IActivity>({
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true
    },
    startTime: { 
        type: Date, 
        required: true
    }, 
    endTime: { 
        type: Date, 
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    distance: { 
        type: Number,
        required: true
    },
    elevationGain: { 
        type: Number,
        required: true
    },
    averageSpeed: { 
        type: Number,
        required: true
    },
    caloriesBurned: { 
        type: Number,
        required: false
    },
    route: [{
        type: Schema.Types.ObjectId,
        ref: 'ReferencePoint',
        required: true
    }],
    musicPlaylist: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
        default: [],
        required: true
    }],
    type: {
        type: String, 
        enum: ["running","cycling","hiking", "walking"],
        required: true
    },
    // Nuevos campos para el seguimiento en tiempo real
    status: {
        type: String,
        enum: ["active", "paused", "completed"],
        default: "completed"
    },
    trackPoints: {
        type: [trackPointSchema],
        default: []
    },
    lastUpdateTime: {
        type: Date,
        default: null
    },
    realTimeStats: {
        type: realTimeStatsSchema,
        default: () => ({})
    },
    pauseTime: {
        type: Number,
        default: 0
    },
    pausedAt: {
        type: Date,
        default: null
    }
});

// Actualizar la interfaz para incluir los nuevos campos
export interface ITrackPoint {
    latitude: number;
    longitude: number;
    altitude?: number;
    timestamp: Date;
    heartRate?: number;
    cadence?: number;
    speed?: number;
}

export interface IRealTimeStats {
    currentSpeed: number;
    currentPace: number;
    currentHeartRate?: number;
    currentCadence?: number;
    elapsedTime: number;
    elapsedDistance: number;
    caloriesBurned: number;
    lastUpdate: Date;
}

export interface IActivity {
    _id?: mongoose.Types.ObjectId; // Añadido campo _id para resolver el error
    author: mongoose.Types.ObjectId;
    name: string;
    startTime: Date; 
    endTime: Date;
    duration: number; //minutos
    distance: number;
    elevationGain: number;
    averageSpeed: number;
    caloriesBurned?: number; //almacenar en minutos
    route: mongoose.Types.ObjectId[]; //ruta enregistrada (llista de punts gps)
    musicPlaylist: mongoose.Types.ObjectId[];
    type: "running"|"cycling"|"hiking"|"walking";
    // Nuevos campos
    status?: "active"|"paused"|"completed";
    trackPoints?: ITrackPoint[];
    lastUpdateTime?: Date;
    realTimeStats?: IRealTimeStats;
    pauseTime?: number;
    pausedAt?: Date;
}

const ActivityModel = mongoose.model('Activity', activitySchema);
export default ActivityModel;