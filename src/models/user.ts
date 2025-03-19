import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el documento de usuario
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  level: number;
  totalDistance: number;
  totalTime: number;
  activities: mongoose.Types.ObjectId[];
  achievements: mongoose.Types.ObjectId[];
  challengesCompleted: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de usuario
const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  activities: [{
    type: Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  achievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  challengesCompleted: [{
    type: Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save para actualizar la fecha de modificación
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Crear y exportar el modelo
const User = mongoose.model<IUser>('User', userSchema);
export default User;