// src/controllers/referencePoint_controller.ts

import { 
    addReferencePoint, 
    getReferencePointsByActivity, 
    getReferencePointById, 
    updateReferencePoint, 
    deleteReferencePoint 
} from '../services/referencePointService';

import express, { Request, Response } from 'express';

// Crear un nou punt de referència
export const addReferencePointHandler = async (req: Request, res: Response) => {
    try {
        if (!req.body){
            res.status(400).json({message: "Content can not be empty!"});
        }
        const { activity, latitude, longitude, timestamp } = req.body;
        if (!activity || !latitude || !longitude || !timestamp) {
            res.status(400).json({message: "There are missing fields"});
        }
        const newPoint = await addReferencePoint(req.body);
        res.json(newPoint);
        res.status(201).json({message: "New reference point created"});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un punt de referència per ID
export const getReferencePointByIdHandler = async (req: Request, res: Response) => {
    try {
        const getPoint = await getReferencePointById(req.params.id);
        if (!getPoint) {
            res.status(404).json({ message: "Not found" });
        }

        res.status(200).json(getPoint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Actualitzar un punt de referència
export const updateReferencePointHandler = async (req: Request, res: Response) => {
    try {
        const updatePoint = await updateReferencePoint(req.params.id, req.body);
        if(!updatePoint){
            res.status(404).json({ message: "Not found" });
        }
        res.status(200).json(updatePoint);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un punt de referència
export const deleteReferencePointHandler = async (req: Request, res: Response) => {
    try {
        const data = await deleteReferencePoint(req.params.id);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir tots els punts d'una activitat
export const getReferencePointsByActivityHandler = async (req: Request, res: Response) => {
    try {
        const data = await getReferencePointsByActivity(req.params.activityId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
