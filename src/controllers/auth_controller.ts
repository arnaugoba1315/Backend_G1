import { Request, Response } from "express";
import { registerNewUser, loginUser, refreshUserToken, logoutUser, googleAuth } from "../services/auth_service";
import mongoose from "mongoose";
import User from "../models/user"; 

export const registerCtrl = async ({body}: Request, res: Response) => {
    try{
        // Verificamos que username, email y password estén presentes
        const { username, email, password } = body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: "Todos los campos (username, email, password) son requeridos" 
            });
        }
        
        const responseUser = await registerNewUser(body);
        res.json(responseUser);
    } catch (error: any){
        res.status(500).json({ message: error.message });
    }
};

// Modificado: Enviar objeto usuario completo en la respuesta
export const loginCtrl = async ({ body }: Request, res: Response) => {
    try {
        const { username, email, password } = body;
        
        // Validamos que tengamos al menos email y password
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email y password son requeridos" 
            });
        }
        
        const responseUser = await loginUser({username, email, password });

        if (responseUser === 'INCORRECT_PASSWORD') {
            return res.status(403).json({ message: 'Contraseña incorrecta' });
        }

        if (responseUser === 'NOT_FOUND_USER') {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar el objeto usuario completo en la respuesta
        return res.json({
            token: responseUser.token,
            refreshToken: responseUser.refreshToken,
            user: responseUser.user // Objeto usuario completo
        });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Lo mismo para el método googleAuthCallback
export const googleAuthCallback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        
        if (!code) {
            return res.status(400).json({ message: 'Código de autorización faltante' });
        }

        const authData = await googleAuth(code);
        
        if (!authData) {
            return res.redirect('/login?error=authentication_failed');
        }
        
        // Redirigir al frontend con ambos tokens como parámetros de consulta
        res.redirect(`http://localhost:4200/?token=${authData.token}&refreshToken=${authData.refreshToken}`);   
    } catch (error: any) {
        console.error('Error en callback de Google:', error);
        res.redirect('/login?error=server_error');
    }
};

export const refreshTokenCtrl = async (req: Request, res: Response) => {
    try {
        // Obtenemos el refresh token de las cookies o del body
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token no proporcionado' });
        }
        
        const result = await refreshUserToken(refreshToken);
        
        if (result === 'INVALID_REFRESH_TOKEN') {
            return res.status(401).json({ message: 'Refresh token inválido' });
        }
        
        if (result === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        if (result === 'REFRESH_TOKEN_MISMATCH') {
            return res.status(401).json({ message: 'Refresh token no coincide' });
        }
        
        // Configurar las cookies con los nuevos tokens
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
        
        return res.json({ token: result.token });
        
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const logoutCtrl = async (req: Request, res: Response) => {
    try {
        // Obtenemos el id del usuario del token (que debería estar en req.user)
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'No autorizado' });
        }
        
        await logoutUser(userId);
        
        // Eliminar cookies
        res.clearCookie('refreshToken');
        
        return res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const googleAuthCtrl = async(req: Request, res: Response) =>{
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URL;
    if (!redirectUri) {
        console.error(" ERROR: GOOGLE_OAUTH_REDIRECT_URL no està definida a .env");
        return res.status(500).json({ message: "Error interno de configuración" });
    }
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = new URLSearchParams({
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL!,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
    });
    const fullUrl= `${rootUrl}?${options.toString()}`;
    console.log("Redireccionando a:", fullUrl); 
    res.redirect(fullUrl);
}
export const getUserByIdCtrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
            return;
        }

        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error en getUserByIdCtrl:', error);
        res.status(500).json({
            success: false,
            message: "Error al obtener datos del usuario",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};