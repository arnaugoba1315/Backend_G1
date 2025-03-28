import ActivityModel, { IActivity } from "../models/activity";
import UserModel from "../models/user";

// Crear una nueva actividad y asociarla a un usuario
export const createActivity = async (userId: string, activityData: Omit<IActivity, 'user'>): Promise<IActivity> => {
    const activity = await ActivityModel.create({ ...activityData, user: userId });

    // Agregar la actividad al array de actividades del usuario
    await UserModel.findByIdAndUpdate(userId, { $push: { activities: activity._id } });

    return activity;
};

// Obtener una actividad por ID
export const getActivityById = async (activityId: string): Promise<IActivity | null> => {
    return await ActivityModel.findById(activityId).populate('route').populate('musicPlaylist').populate('author');
};

// Obtener todas las actividades de un usuario
export const getActivitiesByUserId = async (userId: string): Promise<IActivity[]> => {
    return await ActivityModel.find({ user: userId }).populate('route').populate('musicPlaylist');
};

// Obtener todas las actividades
export const getAllActivities = async (): Promise<IActivity[]> => {
    return await ActivityModel.find().populate('route').populate('musicPlaylist').populate('author');
};

// Actualizar una actividad
export const updateActivity = async (activityId: string, activityData: Partial<IActivity>): Promise<IActivity | null> => {
    return await ActivityModel.findByIdAndUpdate(activityId, activityData, { new: true });
};

// Eliminar una actividad y quitar la referencia del usuario
export const deleteActivity = async (activityId: string): Promise<IActivity | null> => {
    const activity = await ActivityModel.findByIdAndDelete(activityId);
    if (activity) {
        await UserModel.findByIdAndUpdate(activity.author, { $pull: { activities: activityId } });
    }
    return activity;
};
