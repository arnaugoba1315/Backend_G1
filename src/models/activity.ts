import mongoose, {Schema, model, Types}from "mongoose"

export interface IActivity {
    user: mongoose.Types.ObjectId;
    name: string;
    startTime: Date; 
    endTime: Date;
    duration: number;//minutos
    distance: number;
    elevationGain?: number;
    averageSpeed: number;
    caloriesBurned?: number; //almacenar en minutos
    route?: mongoose.Types.ObjectId; //ruta enregistrada (llista de punts gps)
    musicPlaylist?: mongoose.Types.ObjectId;
    type:"running"|"cycling"|"hiking"|"walking";
}

export const activitySchema = new Schema<IActivity>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true},
    startTime: { type: Date, required: true}, 
    endTime: { type: Date, required: true},
    duration: {type: Number, required:true},
    distance: { type: Number,required:true},
    elevationGain: { type: Number,required:false},
    averageSpeed: { type: Number,required:true},
    caloriesBurned: { type: Number,required:false},
    route: {
        type: Schema.Types.ObjectId,
        ref: 'ReferencePoint',
        required: false
    },
    musicPlaylist: {
        type: Schema.Types.ObjectId,
        ref: 'Song',
        required: false
    },
    type: {
        type: String, 
        enum: ["running","cycling","hiking", "walking"],
        required: true
    },
});

const activityModel = model<IActivity>('Activity',activitySchema);

export default  activityModel;