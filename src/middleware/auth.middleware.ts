import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) return res.status(401).json({ message: "Acceso denegado" });

  try {
    const decoded = AuthService.verifyToken(token) as { userId: string };
    req.body.userId = decoded.userId; // Agregar el ID del usuario a la request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};
