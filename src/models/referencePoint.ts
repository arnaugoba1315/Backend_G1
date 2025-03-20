import mongoose, {Schema} from "mongoose";
const referencePointSchema = new mongoose.Schema({
    name :{
        type: String,
        require: false
    },
    activity :{
        type: Schema.Types.ObjectId,
        require: true
    },
    latitude :{
        type: Number,
        require: true
    },
    longitude :{
        type: Number,
        require: true
    },
    timestamp :{ //temps de gravació del punt de referència
        type: Date,
        require: true
    },
    altitude :{
        type: Number,
        require: false
    },
    heartRate :{
        type: Number,
        require: false
    }
});

export interface IReferencePoint{
    name?: string;
    activity: mongoose.Types.ObjectId[];
    latitude: number;
    longitude: number;
    timestamp: Date;
    altitude?: number;
    heartRate?: number;
}

const ReferencePoint = mongoose.model('ReferencePoint', referencePointSchema);
export default ReferencePoint;