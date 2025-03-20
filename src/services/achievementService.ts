import {IAchievement} from "../models/achievement";
import achievementModel from "../models/achievement";


export const achievementEntry = {
    createAchievement : async(newAchievement: IAchievement)=> {
        return await achievementModel.create(newAchievement);
    },
    getAchievementbyId : async(achievementId: string)=>{
        return await achievementModel.findById(achievementId);
    },
    getAllAchievement : async()=>{
        return await achievementModel.find();
    },
    updateAchievement : async(achievementId: string, updatedAchievement: IAchievement)=>{
        return await achievementModel.findByIdAndUpdate(achievementId, updatedAchievement, {new: true});
    },
    deleteAchievement : async(achievementId: string)=>{
        return await achievementModel.findByIdAndDelete(achievementId);
    }
}