import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import * as userService from '../services/userService';

/**
 * Crear un nuevo usuario
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, profilePicture, bio } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'Username already exists' });
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
      updatedAt: new Date()
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
      level: user.level
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
    // Obtener página y límite de los parámetros de consulta, con valores predeterminados
    const page = parseInt(req.query.page?.toString() || '1', 10);
    const limit = parseInt(req.query.limit?.toString() || '10', 10);
    
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
    
    // En lugar de eliminar, actualizar el campo visible a false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { visible: false, updatedAt: new Date() },
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
        visible: updatedUser.visibility
      }
    });
  } catch (error) {
    console.error('Error al ocultar usuario:', error);
    res.status(500).json({ message: 'Error al ocultar usuario' });
  }
};