import express from 'express';
import * as challengeController from '../controllers/challengeController';
const router = express.Router();

/**
 * @swagger
 * /api/challenges:
 *   post:
 *     summary: Crea un nuevo challenge
 *     tags: [Challenges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               goalType:
 *                 type: string
 *               goalValue:
 *                 type: string
 *               reward:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Challenge creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del challenge
 *                 title:
 *                   type: string
 *                   description: Título del challenge
 *                 description:
 *                   type: string
 *                   description: Descripción del challenge
 *                 goalType:
 *                   type: string
 *                   description: Tipo de objetivo
 *                 goalValue:
 *                   type: string
 *                   description: Objetivo del challenge
 *                 reward:
 *                   type: number
 *                   description: Recompensa del challenge
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización
 *       400:
 *         description: Datos inválidos en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/', challengeController.createChallengeController);

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Obtener un challenge por su ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge a buscar
 *     responses:
 *       200:
 *         description: Challenge encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del challenge
 *                 title:
 *                   type: string
 *                   description: Título del challenge
 *                 description:
 *                   type: string
 *                   description: Descripción del challenge
 *                 goalType:
 *                   type: string
 *                   description: Tipo de objetivo
 *                 goalValue:
 *                   type: string
 *                   description: Valor del objetivo
 *                 reward:
 *                   type: number
 *                   description: Recompensa del challenge
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización
 *       404:
 *         description: Challenge no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/:id', challengeController.getChallengeByIdController);

/**
 * @swagger
 * /api/challenges/:
 *   get:
 *     summary: Obtener un challenge por su ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge a buscar
 *     responses:
 *       200:
 *         description: Challenge encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del challenge
 *                 title:
 *                   type: string
 *                   description: Título del challenge
 *                 description:
 *                   type: string
 *                   description: Descripción del challenge
 *                 goalType:
 *                   type: string
 *                   description: Tipo de objetivo
 *                 goalValue:
 *                   type: string
 *                   description: Valor del objetivo
 *                 reward:
 *                   type: number
 *                   description: Recompensa del challenge
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: Error interno del servidor
 */
router.get('/', challengeController.getAllChallengesController);

/**
 * @swagger
 * /api/challenges/active:
 *   get:
 *     summary: Obtener todos los challenges activos
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Lista de challenges activos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                   example: "Challenges activos obtenidos exitosamente"
 *                 challenges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único del challenge
 *                       title:
 *                         type: string
 *                         description: Título del challenge
 *                       description:
 *                         type: string
 *                         description: Descripción del challenge
 *                       goalType:
 *                         type: string
 *                         description: Tipo de objetivo
 *                       goalValue:
 *                         type: string
 *                         description: Valor del objetivo
 *                       reward:
 *                         type: number
 *                         description: Recompensa del challenge
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Fecha de finalización
 *       404:
 *         description: No se encontraron challenges activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron challenges activos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener los challenges activos"
 */
router.get('/active', challengeController.getActiveChallengesController);

/**
 * @swagger
 * /api/challenges/inactive:
 *   get:
 *     summary: Obtener todos los challenges inactivos
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Lista de challenges inactivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                   example: "Challenges inactivos obtenidos exitosamente"
 *                 challenges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único del challenge
 *                       title:
 *                         type: string
 *                         description: Título del challenge
 *                       description:
 *                         type: string
 *                         description: Descripción del challenge
 *                       goalType:
 *                         type: string
 *                         description: Tipo de objetivo
 *                       goalValue:
 *                         type: string
 *                         description: Valor del objetivo
 *                       reward:
 *                         type: number
 *                         description: Recompensa del challenge
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Fecha de finalización
 *       404:
 *         description: No se encontraron challenges inactivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron challenges inactivos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener los challenges inactivos"
 */
router.get('/inactive', challengeController.getInactiveChallengesController);

/**
 * @swagger
 * /api/challenges/{id}:
 *   put:
 *     summary: Actualizar un challenge existente
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título del challenge
 *               description:
 *                 type: string
 *                 description: Nueva descripción del challenge
 *               goalType:
 *                 type: string
 *                 description: Nuevo tipo de objetivo
 *               goalValue:
 *                 type: string
 *                 description: Nuevo valor del objetivo
 *               reward:
 *                 type: number
 *                 description: Nueva recompensa del challenge
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de finalización
 *     responses:
 *       200:
 *         description: Challenge actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del challenge
 *                 title:
 *                   type: string
 *                   description: Título actualizado
 *                 description:
 *                   type: string
 *                   description: Descripción actualizada
 *                 goalType:
 *                   type: string
 *                   description: Tipo de objetivo actualizado
 *                 goalValue:
 *                   type: string
 *                   description: Valor del objetivo actualizado
 *                 reward:
 *                   type: number
 *                   description: Recompensa actualizada
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio actualizada
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización actualizada
 *       404:
 *         description: Challenge no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id', challengeController.updateChallengeController);


/**
 * @swagger
 * /api/challenges/{id}:
 *   delete:
 *     summary: Eliminar un challenge
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge a eliminar
 *     responses:
 *       200:
 *         description: Challenge eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                   example: "Challenge eliminado exitosamente"
 *       404:
 *         description: Challenge no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró el challenge"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al eliminar el challenge"
 */
router.delete('/delete/:challengeId', challengeController.deleteChallengeController);

export default router;