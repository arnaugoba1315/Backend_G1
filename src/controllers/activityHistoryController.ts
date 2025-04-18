import { Request, Response } from 'express';
import * as activityHistoryService from '../services/activityHistoryService';

// Obtener historial por ID de actividad
export const getHistoryByActivityIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = req.params.activityId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await activityHistoryService.getHistoryByActivityId(activityId, page, limit);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error al obtener historial de actividad:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los registros de historial
export const getAllActivityHistoryController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await activityHistoryService.getAllActivityHistory(page, limit);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error al obtener historial de actividades:', error);
    res.status(500).json({ message: error.message });
  }
};

// Buscar en el historial
export const searchActivityHistoryController = async (req: Request, res: Response) => {
  try {
    const query = req.body.query || {};
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Si hay userId en la consulta, usarlo
    if (req.body.userId) {
      query.userId = req.body.userId;
    }
    
    // Si hay changeType en la consulta, usarlo
    if (req.body.changeType) {
      query.changeType = req.body.changeType;
    }
    
    const result = await activityHistoryService.searchActivityHistory(query, page, limit);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error al buscar en el historial:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un registro de historial
export const deleteActivityHistoryController = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const historyId = req.params.id;
    const result = await activityHistoryService.deleteActivityHistory(historyId);
    
    if (!result) {
      return res.status(404).json({ message: 'Registro de historial no encontrado' });
    }
    
    res.status(200).json({ message: 'Registro de historial eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar registro de historial:', error);
    res.status(500).json({ message: error.message });
  }
};