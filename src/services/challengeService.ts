import Challenge, { IChallenge } from "../models/challenge";

export const createChallenge = async(newChallenge: IChallenge) => {
    return await Challenge.create(newChallenge);
};
export const getChallengeById = async(challengeId: string)=>{
    return await Challenge.findById(challengeId);
};
export const getAllChallenges = async()=>{
    return await Challenge.find();
};
export const updateChallenge = async(challengeId: string, updatedChallenge: IChallenge)=>{
    return await Challenge.findByIdAndUpdate(challengeId, updatedChallenge, {new: true});
};
export const deleteChallenge = async(challengeId: string)=>{
    return await Challenge.findByIdAndDelete(challengeId);
};
export const getActiveChallenges = async()=>{
    return await Challenge.find({endDate: {$gte: new Date()}});
};
export const getInactiveChallenges = async()=>{
    return await Challenge.find({endDate: {$lte: new Date()}});
};