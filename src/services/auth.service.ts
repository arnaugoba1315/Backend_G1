import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/env";
import  UserModel from "../models/user";

export class AuthService {

    static generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "1h" });
  }

  static verifyToken(token: string) {
    return jwt.verify(token, config.jwtSecret);
  }

  static async register(username: string, email: string, password: string, profilePicture?: string, bio?: string) {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) throw new Error("Username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
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

    await newUser.save();
    return newUser;
  }

  static async login(username: string, password: string) {
    const user = await UserModel.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        level: user.level
      }
    };
  }
}
