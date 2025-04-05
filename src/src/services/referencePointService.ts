import ReferencePointModel, { IReferencePoint } from "../models/referencePoint";

//afegir un punt de referència
export const addReferencePoint = async (pointData: IReferencePoint) => {
    const point = new ReferencePointModel(pointData);
    return await point.save();
};

//obtenir un punt de referència per ID
export const getReferencePointById = async (id: string) => {
    return await ReferencePointModel.findById(id);
};

//actualitzar un punt de referència
export const updateReferencePoint = async (id: string, updateData: Partial<IReferencePoint>) => {
    return await ReferencePointModel.updateOne({ _id: id }, { $set: updateData });
};

//eliminar un punt de referència
export const deleteReferencePoint = async (id: string) => {
    return await ReferencePointModel.deleteOne({ _id: id });
};
