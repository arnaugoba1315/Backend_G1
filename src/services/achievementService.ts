import Achievement, {IAchievement} from '../models/achievement';


export const createAchievement = async(newAchievement: IAchievement)=> {
    return await Achievement.create(newAchievement);
};
export const getAchievementbyId = async(achievementId: string)=>{
    return await Achievement.findById(achievementId);
};
export const getAllAchievement = async()=>{
    return await Achievement.find();
};
export const updateAchievement = async(achievementId: string, updatedAchievement: IAchievement)=>{
    return await Achievement.findByIdAndUpdate(achievementId, updatedAchievement, {new: true});
};
export const deleteAchievement = async(achievementId: string)=>{
    return await Achievement.findByIdAndDelete(achievementId);
};