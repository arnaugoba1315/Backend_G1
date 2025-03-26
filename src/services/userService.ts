import UserModel, { IUser } from '../models/user';
import mongoose from 'mongoose';

/**
 * Obtener usuarios con paginación
 */
export const getPaginatedUsers = async (page: number = 1, limit: number = 10, includeInvisible: boolean = false): Promise<{
  users: IUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    
    const query = includeInvisible ? {} : { visibility: true };
    
    console.log("Consulta MongoDB:", JSON.stringify(query));
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error("La conexión a MongoDB no está disponible");
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("La base de datos no está disponible");
    }
    
    const collection = db.collection('users');
    
    const users = await collection.find(query)
      .skip(skip)
      .limit(limit)
      .project({ password: 0 }) // Excluir la contraseña
      .toArray();
    
    const totalUsers = await collection.countDocuments(query);
    
    const totalPages = Math.ceil(totalUsers / limit);
    
    console.log(`Encontrados ${users.length} usuarios de un total de ${totalUsers}`);
    
    return {
      users: users as unknown as IUser[],
      totalUsers,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error al obtener usuarios paginados:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por su ID
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  return await UserModel.findById(userId);
};

/**
 * Obtener un usuario por su nombre de usuario
 */
export const getUserByUsername = async (username: string): Promise<IUser | null> => {
  return await UserModel.findOne({ username });
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (includeInvisible: boolean = false): Promise<IUser[]> => {
  const query = includeInvisible ? {} : { visibility: true };
  return await UserModel.find(query);
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
  return await UserModel.findByIdAndUpdate(
    userId,
    userData,
    { new: true }
  );
};

/**
 * Eliminar un usuario
 */
export const deleteUser = async (userId: string): Promise<IUser | null> => {
  return await UserModel.findByIdAndDelete(userId);
};

/**
 * Añadir una actividad a un usuario
 */
export const addActivityToUser = async (userId: string, activityId: string): Promise<IUser | null> => {
  return await UserModel.findByIdAndUpdate(
    userId,
    { $push: { activities: new mongoose.Types.ObjectId(activityId) } },
    { new: true }
  );
};

export const getUserByIdIgnoringVisibility = async (userId: string): Promise<IUser | null> => {
  // Utilizamos findById pero luego hacemos el lean() para obtener un objeto JS plano
  // y el 'getOptions' con { includeInvisible: true } para indicar que queremos omitir el filtro de visibilidad
  return await UserModel.findById(userId).lean({ getters: true });
};

// Añadir visibilidad a un usuario
export const toggleUserVisibility = async (userId: string): Promise<IUser | null> => {
  try {
    // 1. Primero, obtenemos el documento directamente (saltando los pre-hooks)
    // usando el método findOne directamente con la opción strict false
    const userDoc = await UserModel.collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!userDoc) {
      return null;
    }
    
    // 2. Invertimos el valor de visibility
    const currentVisibility = userDoc.visibility !== undefined ? userDoc.visibility : true;
    const newVisibility = !currentVisibility;
    
    // 3. Actualizamos el documento con el nuevo valor
    await UserModel.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { visibility: newVisibility, updatedAt: new Date() } }
    );
    
    // 4. Para devolver el documento actualizado, lo volvemos a buscar
    // Nota: Este paso podría omitirse o reemplazarse si solo necesitas confirmar que se actualizó
    const updatedUser = await UserModel.collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!updatedUser) {
      return null;
    }
    
    // 5. Convertimos el documento a IUser (formato que espera el controlador)
    return {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      level: updatedUser.level,
      totalDistance: updatedUser.totalDistance,
      totalTime: updatedUser.totalTime,
      activities: updatedUser.activities || [],
      achievements: updatedUser.achievements || [],
      challengesCompleted: updatedUser.challengesCompleted || [],
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      visibility: updatedUser.visibility
    } as IUser;
  } catch (error) {
    console.error('Error en toggleUserVisibility:', error);
    return null;
  }
};