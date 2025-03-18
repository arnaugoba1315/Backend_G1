import Song, {ISong} from '../models/song.js';

export const createSong = async (song:ISong) => {
    const newSong = new Song(song);
    return await newSong.save();
};