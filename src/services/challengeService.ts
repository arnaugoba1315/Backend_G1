
import ChallengeModel, { IChallenge } from "../models/challenge";

export const createChallenge = async(newChallenge: IChallenge) => {
    return await ChallengeModel.create(newChallenge);
};
export const getChallengeById = async(challengeId: string)=>{
    return await ChallengeModel.findById(challengeId);
};
export const getAllChallenges = async()=>{
    return await ChallengeModel.find();
};
export const updateChallenge = async(challengeId: string, updatedChallenge: IChallenge)=>{
    return await ChallengeModel.findByIdAndUpdate(challengeId, updatedChallenge, {new: true});
};
export const deleteChallenge = async(challengeId: string)=>{
    return await ChallengeModel.findByIdAndDelete(challengeId);
};
export const getActiveChallenges = async()=>{
    return await ChallengeModel.find({endDate: {$gte: new Date()}});
};
export const getInactiveChallenges = async()=>{
    return await ChallengeModel.find({endDate: {$lte: new Date()}});
};
