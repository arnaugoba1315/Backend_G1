import express from 'express';
import * as chatController from '../controllers/chatController';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       required:
 *         - name
 *         - participants
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre de la sala de chat
 *         description:
 *           type: string
 *           description: Descripción de la sala de chat
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: IDs de los usuarios participantes
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la sala
 *         lastMessage:
 *           type: string
 *           description: Último mensaje enviado en la sala
 *         lastMessageTime:
 *           type: string
 *           format: date-time
 *           description: Fecha del último mensaje
 *     Message:
 *       type: object
 *       required:
 *         - roomId
 *         - senderId
 *         - content
 *       properties:
 *         roomId:
 *           type: string
 *           format: objectId
 *           description: ID de la sala de chat
 *         senderId:
 *           type: string
 *           format: objectId
 *           description: ID del usuario que envía el mensaje
 *         content:
 *           type: string
 *           description: Contenido del mensaje
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del mensaje
 *         read:
 *           type: boolean
 *           description: Indica si el mensaje ha sido leído
 */

/**
 * @openapi
 * /api/chat/rooms:
 *   post:
 *     summary: Create a new chat room
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post('/rooms', chatController.createChatRoomController);

/**
 * @openapi
 * /api/chat/rooms/user/{userId}:
 *   get:
 *     summary: Get all chat rooms for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of chat rooms
 *       500:
 *         description: Server error
 */
router.get('/rooms/user/:userId', chatController.getChatRoomsForUserController);

/**
 * @openapi
 * /api/chat/rooms/{id}:
 *   get:
 *     summary: Get a chat room by ID
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat room ID
 *     responses:
 *       200:
 *         description: Chat room details
 *       404:
 *         description: Chat room not found
 *       500:
 *         description: Server error
 */
router.get('/rooms/:id', chatController.getChatRoomByIdController);

/**
 * @openapi
 * /api/chat/messages/{roomId}:
 *   get:
 *     summary: Get messages for a chat room
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat room ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to retrieve
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get('/messages/:roomId', chatController.getMessagesForRoomController);

/**
 * @openapi
 * /api/chat/messages:
 *   post:
 *     summary: Send a message (HTTP fallback, primarily done via Socket.IO)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - senderId
 *               - content
 *             properties:
 *               roomId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post('/messages', chatController.sendMessageController);

/**
 * @openapi
 * /api/chat/messages/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - userId
 *             properties:
 *               roomId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Server error
 */
router.post('/messages/read', chatController.markMessagesAsReadController);

/**
 * @openapi
 * /api/chat/rooms/{id}:
 *   delete:
 *     summary: Delete a chat room
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat room ID
 *     responses:
 *       200:
 *         description: Chat room deleted successfully
 *       404:
 *         description: Chat room not found
 *       500:
 *         description: Server error
 */
router.delete('/rooms/:id', chatController.deleteChatRoomController);

export default router;