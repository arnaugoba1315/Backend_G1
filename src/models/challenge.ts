import mongoose, {ObjectId,Schema, model, Types} from "mongoose"

export interface IChallenge {
    
    title: string;
    description: string; 
    goalType: string;
    goalValue: string;
    reward: number;
    startDate: Date;
    endDate: Date;
    participants: mongoose.Types.ObjectId[];
}

export const challengeSchema = new Schema<IChallenge>({

    title: { type: String, required: true},
    description: { type: String, required: true}, 
    goalType: { type: String, required: true},
    goalValue: {type: String, required:true},
    reward: { type: Number,required:true},
    startDate: { type: Date,required:true},
    endDate: { type: Date,required:true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true}],
});

const challengeModel = model<IChallenge>('Achievement',challengeSchema);

export default  challengeModel;