import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import * as userService from '../services/userService';
import mongoose from 'mongoose';


/**
 * Obtener usuarios con paginación
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener página y límite de los parámetros de consulta, con valores predeterminados
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    
     // Procesar el parámetro includeInvisible
     const includeInvisible = req.query.includeInvisible === 'true';
    
     console.log(`Solicitud de usuarios: página ${page}, límite ${limit}, incluir invisibles: ${includeInvisible}`);

    // Validar parámetros de paginación
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({ message: 'Parámetros de paginación inválidos' });
      return;
    }
    
    // Obtener usuarios paginados
    const result = await userService.getPaginatedUsers(page, limit, includeInvisible);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};


/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Si se actualiza la contraseña, hashearla
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    // Añadir fecha de actualización
    updates.updatedAt = new Date();
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

/**
 * Soft delete - Marcar usuario como no visible en lugar de eliminarlo
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // En lugar de eliminar, actualizar el campo visibility a false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { visibility: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedUser) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json({ 
      message: 'Usuario marcado como no visible correctamente',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        visibility: updatedUser.visibility
      }
    });
  } catch (error) {
    console.error('Error al ocultar usuario:', error);
    res.status(500).json({ message: 'Error al ocultar usuario' });
  }
};

/**
 * Alternar visibilidad de un usuario
 */
export const toggleUserVisibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Utilitzem directament el mètode de connexió de MongoDB per evitar els hooks de Mongoose
    const db = mongoose.connection.db;
    
    if (!db) {
      res.status(500).json({ message: 'Error de conexión con la base de datos' });
      return;
    }
    
    const usersCollection = db.collection('users');
    
    // Pas 1: trobar l'usuari per ID
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Pas 2: Invertir el valor de visibility
    const currentVisibility = user.visibility !== undefined ? user.visibility : true;
    const newVisibility = !currentVisibility;
    
    // Pas 3: actualitzar el document
    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { visibility: newVisibility, updatedAt: new Date() } }
    );
    
    // Pas 4: obtenir l'usuari actualitzat
    const updatedUser = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!updatedUser) {
      res.status(500).json({ message: 'Error al recuperar el usuario actualizado' });
      return;
    }
    
    // Pas 5: Enviar resposta
    res.status(200).json({
      message: `Usuario ${newVisibility ? 'visible' : 'oculto'} correctamente`,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        visibility: newVisibility
      }
    });
  } catch (error) {
    console.error('Error al cambiar la visibilidad del usuario:', error);
    res.status(500).json({ message: 'Error al cambiar la visibilidad del usuario' });
  }
};