import {
    createSong, 
    getAllSongs, 
    getSongById, 
    getSongByName, 
    getSongsByArtist, 
    getSongsByGenre,
    getSymilarBpm, 
    updateSong, 
    deleteSong
} from '../services/songService.js';

import { Request, Response } from 'express';

export const createSongController = async (req: Request, res: Response) => {
    try{
        const song = await createSong(req.body);
        if(!song){
            return res.status(400).json({message: 'Error creating song'});
        }
        res.status(200).json(song);
    }catch(err:any){
        res.status(500).json({message:"Server error: ", err});
    }
};

export const getAllSongsController = async (req: Request, res: Response) => {
    try{
        const songs = await getAllSongs();
        if(!songs){
            res.status(401).json({message: 'No songs found'});
        }
        res.status(200).json(songs);
    }catch(err:any){
        res.status(500).json({message:"Server error: " ,err});

    }
};

export const getSongByIdController = async (req: Request, res: Response) => {
    try{
        const song = await getSongById(req.params.id);
        if(!song){
            res.status(401).json({message: `Song with Id ${req.params.id} not found`});
        }
        res.status(200).json(song);
    }catch(err:any){
        res.status(500).json({message:"Server error: ", err});
    }
};

export const getSongByNameController = async (req: Request, res: Response) => {
    try{
        const song = await getSongByName(req.params.name);
        if(!song){
            res.status(401).json({message: `Song "${req.params.name}" not found`});
        }
        res.status(200).json(song);
    }catch(err:any){
        res.status(500).json({message:"Server error: ", err});
    }
};

export const getSongsByArtistController = async (req: Request, res: Response) => {
    try{
        const song = await getSongsByArtist(req.params.artist);
        if(!song){
            res.status(401).json({message: `Artist "${req.params.artist}" not found`});
        }
        res.status(200).json(song);
    }catch(err:any){
        res.status(500).json({message:"Server error: ", err});
    }
};

export const getSongsByGenreController = async (req: Request, res: Response) => {
    try{
        const song = await getSongsByGenre(req.params.genre);
        if(!song){
            res.status(401).json({message: `Genre "${req.params.genre}" not found`});
        }
        res.status(200).json(song);
    }catch(err:any){
        res.status(500).json({message:"Server error: ", err});
    }
};

export const getSymilarBpmController = async (req: Request, res: Response) => {};

export const updateSongController = async (req: Request, res: Response) => {};

export const deleteSongController = async (req: Request, res: Response) => {};
