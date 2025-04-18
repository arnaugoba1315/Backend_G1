import ActivityHistoryModel, { IActivityHistory } from '../models/activityHistory';
import mongoose from 'mongoose';

// Crear un nuevo registro de historial
export const createActivityHistory = async (historyData: IActivityHistory): Promise<IActivityHistory> => {
  return await ActivityHistoryModel.create(historyData);
};

// Obtener historial por ID
export const getActivityHistoryById = async (historyId: string): Promise<IActivityHistory | null> => {
  return await ActivityHistoryModel.findById(historyId)
    .populate('activityId')
    .populate('userId');
};

// Obtener historial por ID de actividad
export const getHistoryByActivityId = async (activityId: string, page: number = 1, limit: number = 10): Promise<{
  histories: IActivityHistory[];
  total: number;
  page: number;
  pages: number;
}> => {
  const skip = (page - 1) * limit;
  
  const histories = await ActivityHistoryModel.find({ activityId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username')
    .populate('activityId', 'name');
    
  const total = await ActivityHistoryModel.countDocuments({ activityId });
  
  return {
    histories,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// Obtener todos los registros de historial (paginados)
export const getAllActivityHistory = async (page: number = 1, limit: number = 10): Promise<{
  histories: IActivityHistory[];
  total: number;
  page: number;
  pages: number;
}> => {
  const skip = (page - 1) * limit;
  
  const histories = await ActivityHistoryModel.find()
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username')
    .populate('activityId', 'name');
    
  const total = await ActivityHistoryModel.countDocuments();
  
  return {
    histories,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// Buscar en el historial
export const searchActivityHistory = async (query: any, page: number = 1, limit: number = 10): Promise<{
  histories: IActivityHistory[];
  total: number;
  page: number;
  pages: number;
}> => {
  const skip = (page - 1) * limit;
  
  const histories = await ActivityHistoryModel.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username')
    .populate('activityId', 'name');
    
  const total = await ActivityHistoryModel.countDocuments(query);
  
  return {
    histories,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

// Eliminar un registro de historial
export const deleteActivityHistory = async (historyId: string): Promise<IActivityHistory | null> => {
  return await ActivityHistoryModel.findByIdAndDelete(historyId);
};