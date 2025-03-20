import mongoose, {Schema} from "mongoose";
const referencePointSchema = new mongoose.Schema({
    name :{
        type: String,
        default: '',
        require: false
    },
    latitude :{
        type: Number,
        require: true
    },
    longitude :{
        type: Number,
        require: true
    },
    altitude :{
        type: Number,
        require: true
    }
});

export interface IReferencePoint{
    name?: string;
    latitude: number;
    longitude: number;
    altitude: number;
}

const ReferencePoint = mongoose.model('ReferencePoint', referencePointSchema);
export default ReferencePoint;