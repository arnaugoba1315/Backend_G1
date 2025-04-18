import SongModel, {ISong} from '../models/song';


export const createSong = async (song:ISong) => {
    const newSong = new SongModel(song);
    return await newSong.save();
};

export const getAllSongs = async () => {
    return await SongModel.find();
};

export const getSongById = async (id:string) => {
    return await SongModel.findById(id);
};

export const getSongByName = async (name:string) => {
    return await SongModel.find({title:name});
};

export const getSongsByArtist = async (artist:string) => {
    return await SongModel.find({artist:artist});
};

export const getSongsByGenre = async (genre:string) => {
    return await SongModel.find({genre:genre});
};

export const getSymilarBpm = async (bpm:number) => {
    const songs = await SongModel.find();
    return songs.filter(song => song.bpm !== undefined && song.bpm !== null && Math.abs(song.bpm - bpm) < 20);
};

export const updateSong = async (id:string, song:ISong) => {
    return await SongModel.findByIdAndUpdate(id,song,{new:true});
};

export const deleteSong = async (id:string) => {
    return await SongModel.findByIdAndDelete(id);
};