import User, { IUser } from '../models/user';
import mongoose from 'mongoose';

/**
 * Obtener usuarios con paginación
 */
export const getPaginatedUsers = async (page: number = 1, limit: number = 10): Promise<{
  users: IUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}> => {
  // Calcular cuántos documentos saltar
  const skip = (page - 1) * limit;
  
  // Buscar usuarios con paginación
  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select('-password');
  
  // Contar total de documentos para la información de paginación
  const totalUsers = await User.countDocuments();
  
  // Calcular total de páginas
  const totalPages = Math.ceil(totalUsers / limit);
  
  return {
    users,
    totalUsers,
    totalPages,
    currentPage: page
  };
};
/**
 * Crear un nuevo usuario
 */
export const createUser = async (userData: IUser): Promise<IUser> => {
  return await User.create(userData);
};

/**
 * Obtener un usuario por su ID
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  return await User.findById(userId);
};

/**
 * Obtener un usuario por su nombre de usuario
 */
export const getUserByUsername = async (username: string): Promise<IUser | null> => {
  return await User.findOne({ username });
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    userData,
    { new: true }
  );
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (userId: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(userId);
};

/**
 * Añadir una actividad a un usuario
 */
export const addActivityToUser = async (userId: string, activityId: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { activities: new mongoose.Types.ObjectId(activityId) } },
    { new: true }
  );
};