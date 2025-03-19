import Activity, { IActivity } from "../models/activity";
import User from "../models/user";

// Crear una nueva actividad y asociarla a un usuario
export const createActivity = async (userId: string, activityData: Omit<IActivity, 'user'>): Promise<IActivity> => {
    const activity = await Activity.create({ ...activityData, user: userId });

    // Agregar la actividad al array de actividades del usuario
    await User.findByIdAndUpdate(userId, { $push: { activities: activity._id } });

    return activity;
};

// Obtener una actividad por ID
export const getActivityById = async (activityId: string): Promise<IActivity | null> => {
    return await Activity.findById(activityId).populate('route').populate('musicPlaylist').populate('user');
};

// Obtener todas las actividades de un usuario
export const getActivitiesByUserId = async (userId: string): Promise<IActivity[]> => {
    return await Activity.find({ user: userId }).populate('route').populate('musicPlaylist');
};

// Obtener todas las actividades
export const getAllActivities = async (): Promise<IActivity[]> => {
    return await Activity.find().populate('route').populate('musicPlaylist').populate('user');
};

// Actualizar una actividad
export const updateActivity = async (activityId: string, activityData: Partial<IActivity>): Promise<IActivity | null> => {
    return await Activity.findByIdAndUpdate(activityId, activityData, { new: true });
};

// Eliminar una actividad y quitar la referencia del usuario
export const deleteActivity = async (activityId: string): Promise<IActivity | null> => {
    const activity = await Activity.findByIdAndDelete(activityId);
    if (activity) {
        await User.findByIdAndUpdate(activity.user, { $pull: { activities: activityId } });
    }
    return activity;
};
