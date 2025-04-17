import { Request, Response } from 'express';
import User from '../models/user';
import { deleteActivity } from '../services/activityService';
import bcrypt from 'bcrypt';
import * as userService from '../services/userService';
import mongoose from 'mongoose';

/**
 * Crear un nuevo usuario
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, profilePicture, bio, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.visibility !== false) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }
    
    // Validar el rol si se proporciona
    if (role && !['user', 'admin'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Allowed values are "user" or "admin"' });
      return;
    }
    
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture,
      bio,
      level: 1,
      totalDistance: 0,
      totalTime: 0,
      activities: [],
      achievements: [],
      challengesCompleted: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      role: role || 'user' // Si no se proporciona rol, asignar 'user' por defecto
    });
    
    // Guardar usuario en la base de datos
    await newUser.save();
    
    // Respuesta sin incluir la contraseña
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      bio: newUser.bio,
      level: newUser.level,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

/**
 * Iniciar sesión
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // Verificar que se proporcionaron usuario y contraseña
    if (!username || !password) {
      res.status(400).json({ message: 'Please provide username and password' });
      return;
    }
    
    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Respuesta sin incluir la contraseña
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      level: user.level,
      role: user.role || 'user' // Incluir el rol en la respuesta
    };
    
    res.status(200).json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

/**
 * Obtener usuarios con paginación
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener página y límite de los parámetros de consulta
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
    const result = await userService.getPaginatedUsers(page, limit);
    
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
 * Buscar usuario por nombre de usuario
 */
export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username;
    
    const user = await userService.getUserByUsername(username);
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    // Excluir la contraseña de la respuesta
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      level: user.level,
      totalDistance: user.totalDistance,
      totalTime: user.totalTime,
      activities: user.activities,
      achievements: user.achievements,
      challengesCompleted: user.challengesCompleted,
      visibility: user.visibility,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error al buscar usuario por nombre:', error);
    res.status(500).json({ message: 'Error al buscar usuario por nombre' });
  }
};



export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string || '';
    
    if (!query || query.length < 3) {
      res.status(400).json({ message: 'La consulta de búsqueda debe tener al menos 3 caracteres' });
      return;
    }
    
    const users = await userService.searchUsers(query);
    
    // Excluir contraseñas de la respuesta
    const usersResponse = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      level: user.level,
      role: user.role
    }));
    
    res.status(200).json(usersResponse);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ message: 'Error al buscar usuarios' });
  }
};
/**
 * Actualizar un usuario
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Validar el rol si se está actualizando
    if (updates.role && !['user', 'admin'].includes(updates.role)) {
      res.status(400).json({ message: 'Invalid role. Allowed values are "user" or "admin"' });
      return;
    }
    
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
 * Eliminar un usuario (ahora elimina completamente el usuario y sus actividades)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try{
    const user = await userService.getUserById(req.params.id);
          if(!user){
              res.status(401).json({message: `User "${req.params.title}" not found`});
              return;
          }
          if(user !== null && user.activities){
            for (let activity of user.activities) {
              await deleteActivity(activity._id.toString());
            }
          }
          await userService.deleteUser(req.params.id);
          res.status(201).json(user);
      }catch(err:any){
          res.status(500).json({message:"Server error: ", err});
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
    
    // Pas 3: actualitzar el document i esborrar les seves activitats
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
        visibility: newVisibility,
        role: updatedUser.role || 'user'
      }
    });
  } catch (error) {
    console.error('Error al cambiar la visibilidad del usuario:', error);
    res.status(500).json({ message: 'Error al cambiar la visibilidad del usuario' });
  }
};