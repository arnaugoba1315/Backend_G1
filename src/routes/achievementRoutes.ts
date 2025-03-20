import {Router} from 'express';
import { createAchievement, deleteAchievement, getAchievementbyId, getAllAchievement, updateAchievement } from '../controllers/achievementController';
const router = Router();

/**
 * @swagger
 * /api/achievements:
 *   post:
 *     summary: Crear un nuevo logro
 *     tags: [Achievement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - condition
 *               - icon
 *               - usersUnlocked
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del logro
 *                 example: "Primer Kilometro"
 *               description:
 *                 type: string
 *                 description: Descripción detallada del logro
 *                 example: "Completa tu primer kilómetro corriendo"
 *               condition:
 *                 type: string
 *                 description: Condición para desbloquear el logro
 *                 example: "Distancia >= 1km"
 *               icon:
 *                 type: string
 *                 description: URL o nombre del icono del logro
 *                 example: "medal_bronze.png"
 *               usersUnlocked:
 *                 type: string
 *                 description: ID del usuario que ha desbloqueado el logro
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Logro creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logro creado exitosamente"
 *                 achievement:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único del logro
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "Primer Kilometro"
 *                     description:
 *                       type: string
 *                       example: "Completa tu primer kilómetro corriendo"
 *                     condition:
 *                       type: string
 *                       example: "Distancia >= 1km"
 *                     icon:
 *                       type: string
 *                       example: "medal_bronze.png"
 *                     usersUnlocked:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *       400:
 *         description: Datos inválidos en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todos los campos son requeridos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al crear el logro"
 *                 error:
 *                   type: string
 */
router.post('/', createAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Obtener un logro por su ID
 *     tags: [Achievement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del logro a buscar
 *     responses:
 *       200:
 *         description: Logro encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del logro
 *                   example: "507f1f77bcf86cd799439011"
 *                 title:
 *                   type: string
 *                   description: Título del logro
 *                   example: "Primer Kilometro"
 *                 description:
 *                   type: string
 *                   description: Descripción del logro
 *                   example: "Completa tu primer kilómetro corriendo"
 *                 condition:
 *                   type: string
 *                   description: Condición para desbloquear el logro
 *                   example: "Distancia >= 1km"
 *                 icon:
 *                   type: string
 *                   description: URL o nombre del icono del logro
 *                   example: "medal_bronze.png"
 *                 usersUnlocked:
 *                   type: string
 *                   description: ID del usuario que ha desbloqueado el logro
 *                   example: "507f1f77bcf86cd799439011"
 *       404:
 *         description: Logro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró el logro"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener el logro"
 *                 error:
 *                   type: string
 */
router.get('/:id', getAchievementbyId);

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Obtener todos los logros
 *     tags: [Achievement]
 *     responses:
 *       200:
 *         description: Lista de logros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logros obtenidos exitosamente"
 *                 total:
 *                   type: number
 *                   description: Número total de logros
 *                   example: 3
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único del logro
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         description: Título del logro
 *                         example: "Primer Kilometro"
 *                       description:
 *                         type: string
 *                         description: Descripción del logro
 *                         example: "Completa tu primer kilómetro corriendo"
 *                       condition:
 *                         type: string
 *                         description: Condición para desbloquear el logro
 *                         example: "Distancia >= 1km"
 *                       icon:
 *                         type: string
 *                         description: URL o nombre del icono del logro
 *                         example: "medal_bronze.png"
 *                       usersUnlocked:
 *                         type: string
 *                         description: ID del usuario que ha desbloqueado el logro
 *                         example: "507f1f77bcf86cd799439011"
 *       404:
 *         description: No se encontraron logros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron logros disponibles"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener los logros"
 *                 error:
 *                   type: string
 */
router.get('/', getAllAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   put:
 *     summary: Actualizar un logro existente
 *     tags: [Achievement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del logro a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título del logro
 *                 example: "Primer Kilometro"
 *               description:
 *                 type: string
 *                 description: Nueva descripción del logro
 *                 example: "Completa tu primer kilómetro corriendo"
 *               condition:
 *                 type: string
 *                 description: Nueva condición para desbloquear el logro
 *                 example: "Distancia >= 1km"
 *               icon:
 *                 type: string
 *                 description: Nueva URL o nombre del icono del logro
 *                 example: "medal_bronze.png"
 *               usersUnlocked:
 *                 type: string
 *                 description: Nuevo ID del usuario que ha desbloqueado el logro
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Logro actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logro actualizado exitosamente"
 *                 achievement:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID del logro
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "Primer Kilometro"
 *                     description:
 *                       type: string
 *                       example: "Completa tu primer kilómetro corriendo"
 *                     condition:
 *                       type: string
 *                       example: "Distancia >= 1km"
 *                     icon:
 *                       type: string
 *                       example: "medal_bronze.png"
 *                     usersUnlocked:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *       404:
 *         description: Logro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró el logro"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al actualizar el logro"
 *                 error:
 *                   type: string
 */
router.put('/:id', updateAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   delete:
 *     summary: Eliminar un logro
 *     tags: [Achievement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del logro a eliminar
 *     responses:
 *       200:
 *         description: Logro eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                   example: "Logro eliminado exitosamente"
 *       404:
 *         description: Logro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró el logro"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al eliminar el logro"
 *                 error:
 *                   type: string
 */
router.delete('/delete/:challengeId', deleteAchievement);

export default router;
