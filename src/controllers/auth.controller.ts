import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, profilePicture, bio } = req.body;
      const user = await AuthService.register(username, email, password, profilePicture, bio);

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          level: user.level
        }
      });
    } catch (error) {
      res.status(400).json({ error });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: "Please provide username and password" });
        return;
      }

      const { token, user } = await AuthService.login(username, password);
      res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
      res.status(401).json({ error});
    }
  }
}
