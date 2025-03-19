import {IChallenge } from "../models/challenge";
import challengeModel from "../models/challenge";

export const challengeEntry = {
    createChallenge : async(newChallenge: IChallenge)=> {
        return await challengeModel.create(newChallenge);
    },
    getChallengeById : async(challengeId: string)=>{
        return await challengeModel.findById(challengeId);
    },
    getAllChallenges : async()=>{
        return await challengeModel.find();
    },
    updateChallenge : async(challengeId: string, updatedChallenge: IChallenge)=>{
        return await challengeModel.findByIdAndUpdate(challengeId, updatedChallenge, {new: true});
    },
    deleteChallenge : async(challengeId: string)=>{
        return await challengeModel.findByIdAndDelete(challengeId);
    },
    getActiveChallenges : async()=>{
        return await challengeModel.find({endDate: {$gte: new Date()}});
    },
    getAllchallengs : async()=>{
        return await challengeModel.find({endDate: {$lte: new Date()}});
    },
    addParticipant : async(userId: string, challengeId: string)=>{
        return await challengeModel.findByIdAndUpdate
        (challengeId, {$push: {participants: userId}});
    },
    removeParticipant : async(userId: string, challengeId: string)=>{
        return await challengeModel.findByIdAndUpdate(challengeId, {$pull: {participants: userId}});
    }
}