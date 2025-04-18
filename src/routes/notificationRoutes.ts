import express from 'express';
import * as notificationController from '../controllers/notificationController';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - content
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *           description: ID del usuario que recibe la notificación
 *         type:
 *           type: string
 *           enum: [achievement, challenge, activity, message, friend, system]
 *           description: Tipo de notificación
 *         content:
 *           type: string
 *           description: Contenido del mensaje de la notificación
 *         relatedId:
 *           type: string
 *           format: objectId
 *           description: ID del objeto relacionado con la notificación (opcional)
 *         isRead:
 *           type: boolean
 *           description: Indica si la notificación ha sido leída
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la notificación
 *       example:
 *         userId: "60d725b4e2f7cb001bce5ab1"
 *         type: "achievement"
 *         content: "¡Has desbloqueado el logro Maratonista!"
 *         relatedId: "60d725b4e2f7cb001bce5ab3"
 *         isRead: false
 *         timestamp: "2025-04-16T18:45:00Z"
 */

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
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [achievement, challenge, activity, message, friend, system]
 *               content:
 *                 type: string
 *               relatedId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/', notificationController.createNotificationController);

/**
 * @openapi
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: onlyUnread
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Only return unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', notificationController.getNotificationsForUserController);

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
router.put('/:id/read', notificationController.markNotificationAsReadController);

/**
 * @openapi
 * /api/notifications/user/{userId}/read-all:
 *   put:
 *     summary: Mark all notifications as read for a user
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
router.put('/user/:userId/read-all', notificationController.markAllNotificationsAsReadController);

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
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', notificationController.deleteNotificationController);

/**
 * @openapi
 * /api/notifications/user/{userId}:
 *   delete:
 *     summary: Delete all notifications for a user
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
 *         description: All notifications deleted
 *       500:
 *         description: Server error
 */
router.delete('/user/:userId', notificationController.deleteAllNotificationsController);

export default router;