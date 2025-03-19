import Song, {ISong} from '../models/song.js';
import {Schema} from 'mongoose';

//createSong , getAllSongs, getSongById, updateSong, deleteSong

export const createSong = async (song:ISong) => {
    const newSong = new Song(song);
    return await newSong.save();
};

export const getAllSongs = async () => {
    return await Song.find();
};

export const getSongById = async (id:Schema.Types.ObjectId) => {
    return await Song.findById(id);
};

export const getSongByName = async (name:string) => {
    return await Song.find(title:name);
};

export const updateSong = async (id:Schema.Types.ObjectId, song:ISong) => {
    return await Song.findByIdAndUpdate;
};

export const deleteSong = async (id:Schema.Types.ObjectId) => {
    return await Song.findByIdAndDelete(id);
};

