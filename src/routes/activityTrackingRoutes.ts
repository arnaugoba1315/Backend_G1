import express, { Router, Request, Response } from 'express';
import * as trackingController from '../controllers/trackingController';
import { checkJwt } from '../middleware/session';
const router: Router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TrackPoint:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         latitude:
 *           type: number
 *           description: Coordenada de latitud
 *         longitude:
 *           type: number
 *           description: Coordenada de longitud
 *         altitude:
 *           type: number
 *           description: Altitud en metros sobre el nivel del mar
 *         heartRate:
 *           type: number
 *           description: Ritmo cardíaco en pulsaciones por minuto
 *         cadence:
 *           type: number
 *           description: Cadencia (pasos o pedaladas por minuto)
 *         speed:
 *           type: number
 *           description: Velocidad instantánea en metros por segundo
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Momento de registro del punto
 *     ActivityStatus:
 *       type: string
 *       enum: [active, paused, completed]
 *       description: Estado actual de la actividad
 *     ActivityFollower:
 *       type: object
 *       required:
 *         - userId
 *         - username
 *       properties:
 *         userId:
 *           type: string
 *           description: ID del usuario seguidor
 *         username:
 *           type: string
 *           description: Nombre del usuario seguidor
 */

/**
 * @openapi
 * /api/tracking/start:
 *   post:
 *     summary: Iniciar una nueva actividad en tiempo real
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - startLocation
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la actividad
 *               type:
 *                 type: string
 *                 enum: [running, cycling, hiking, walking]
 *                 description: Tipo de actividad
 *               startLocation:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     description: Latitud inicial
 *                   longitude:
 *                     type: number
 *                     description: Longitud inicial
 *                   altitude:
 *                     type: number
 *                     description: Altitud inicial
 *     responses:
 *       201:
 *         description: Actividad iniciada correctamente
 *       400:
 *         description: Datos inválidos en la petición
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Ya existe una actividad activa para este usuario
 *       500:
 *         description: Error del servidor
 */
router.post('/start', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.startActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/location:
 *   post:
 *     summary: Actualizar la ubicación de una actividad en curso
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrackPoint'
 *     responses:
 *       200:
 *         description: Ubicación actualizada correctamente
 *       400:
 *         description: Datos inválidos en la petición
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada o no activa
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/location', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.updateLocationController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/pause:
 *   post:
 *     summary: Pausar una actividad en curso
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad pausada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada o no activa
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/pause', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.pauseActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/resume:
 *   post:
 *     summary: Reanudar una actividad pausada
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad reanudada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada o no pausada
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/resume', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.resumeActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/finish:
 *   post:
 *     summary: Finalizar una actividad en curso o pausada
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad finalizada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada o ya finalizada
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/finish', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.finishActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/cancel:
 *   post:
 *     summary: Cancelar una actividad en curso o pausada
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad cancelada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada o ya finalizada
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/cancel', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.cancelActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/user/{userId}/active:
 *   get:
 *     summary: Obtener la actividad activa de un usuario
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Actividad activa encontrada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No se encontró ninguna actividad activa
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:userId/active', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.getActiveActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/followers:
 *   get:
 *     summary: Obtener lista de seguidores de una actividad
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Lista de seguidores obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityFollower'
 *                 count:
 *                   type: integer
 *                   description: Número total de seguidores
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Actividad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:activityId/followers', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.getActivityFollowersController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/join:
 *   post:
 *     summary: Unirse a seguir una actividad en tiempo real
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Unido a la actividad correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/join', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.joinActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/leave:
 *   post:
 *     summary: Dejar de seguir una actividad en tiempo real
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Se dejó de seguir la actividad correctamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/leave', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.leaveActivityController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

/**
 * @openapi
 * /api/tracking/{activityId}/emergency:
 *   post:
 *     summary: Enviar una alerta de emergencia durante una actividad
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Latitud actual
 *               longitude:
 *                 type: number
 *                 description: Longitud actual
 *               message:
 *                 type: string
 *                 description: Mensaje opcional de emergencia
 *     responses:
 *       200:
 *         description: Alerta de emergencia enviada correctamente
 *       400:
 *         description: Datos inválidos en la petición
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/emergency', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.sendEmergencyAlertController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});
/**
 * @openapi
 * /api/tracking/{activityId}/message:
 *   post:
 *     summary: Enviar un mensaje a los seguidores de una actividad
 *     tags: [ActivityTracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Contenido del mensaje
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Datos inválidos en la petición
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/:activityId/message', checkJwt, async (req: Request, res: Response) => {
    try {
        await trackingController.sendMessageToFollowersController(req, res);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default router;