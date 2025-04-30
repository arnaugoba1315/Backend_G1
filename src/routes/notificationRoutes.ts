import express, { Router, Request, Response } from 'express';
import * as notificationController from '../controllers/notificationController';

const router: Router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *           description: El ID del usuario que recibe la notificación
 *         type:
 *           type: string
 *           description: El tipo de notificación (challenge_completed, achievement_unlocked, etc.)
 *         title:
 *           type: string
 *           description: El título de la notificación
 *         message:
 *           type: string
 *           description: El mensaje de la notificación
 *         data:
 *           type: object
 *           description: Datos adicionales específicos para el tipo de notificación
 *         read:
 *           type: boolean
 *           description: Indica si la notificación ha sido leída
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la notificación
 */

/**
 * @openapi
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Only return unread notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    await notificationController.getUserNotificationsController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    await notificationController.createNotificationController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    await notificationController.markNotificationAsReadController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/notifications/user/{userId}/read-all:
 *   put:
 *     summary: Mark all user notifications as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Server error
 */
router.put('/user/:userId/read-all', async (req: Request, res: Response) => {
  try {
    await notificationController.markAllNotificationsAsReadController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await notificationController.deleteNotificationController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /api/notifications/bulk:
 *   post:
 *     summary: Send notification to multiple users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Notifications sent successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    await notificationController.sendBulkNotificationsController(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;