// src/controllers/referencePoint_controller.ts

import { 
    addReferencePoint, 
    getReferencePointsByActivity, 
    getReferencePointById, 
    updateReferencePoint, 
    deleteReferencePoint 
} from '../services/referencePointService.js';

import express, { Request, Response } from 'express';

// Crear un nou punt de referència
export const addReferencePointHandler = async (req: Request, res: Response) => {
    try {
        const data = await addReferencePoint(req.body);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un punt de referència per ID
export const getReferencePointByIdHandler = async (req: Request, res: Response) => {
    try {
        const data = await getReferencePointById(req.params.id);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Actualitzar un punt de referència
export const updateReferencePointHandler = async (req: Request, res: Response) => {
    try {
        const data = await updateReferencePoint(req.params.id, req.body);
        res.json(data);
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
