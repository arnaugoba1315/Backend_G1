import {Router} from 'express';
import { createChallenge, getChallengeById, getAllChallenges, updateChallenge, deleteChallenge, getActiveChallenges, getInactiveChallenges, addParticipant, removeParticipant } from '../controllers/challengeController';

const router = Router();

/**
 * @swagger
 * /api/challenge:
 *   post:
 *     summary: Crea un nuevo challenge
 *     tags: [Challenge]
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
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
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
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array de nombres de los participantes
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
router.post('/', createChallenge);

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Obtener un challenge por su ID
 *     tags: [Challenge]
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
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array de IDs de los participantes
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
router.get('/:id', getChallengeById);

/**
 * @swagger
 * /api/challenges/:
 *   get:
 *     summary: Obtener un challenge por su ID
 *     tags: [Challenge]
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
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array de IDs de los participantes
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
router.get('/', getAllChallenges);

/**
 * @swagger
 * /api/challenges/active:
 *   get:
 *     summary: Obtener todos los challenges activos
 *     tags: [Challenge]
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
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Array de IDs de los participantes
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
router.get('/active', getActiveChallenges);

/**
 * @swagger
 * /api/challenges/inactive:
 *   get:
 *     summary: Obtener todos los challenges inactivos
 *     tags: [Challenge]
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
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Array de IDs de los participantes
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
router.get('/inactive', getInactiveChallenges);

/**
 * @swagger
 * /api/challenges/{id}:
 *   put:
 *     summary: Actualizar un challenge existente
 *     tags: [Challenge]
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
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nuevo array de IDs de participantes
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
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array actualizado de participantes
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
router.put('/:id', updateChallenge);

/**
 * @swagger
 * /api/challenges/addParticipant/{userId}/{challengeId}:
 *   put:
 *     summary: Añadir un participante a un challenge
 *     tags: [Challenge]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a añadir al challenge
 *       - in: path
 *         name: challengeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge al que añadir el participante
 *     responses:
 *       200:
 *         description: Participante añadido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                   example: "Participante añadido exitosamente"
 *                 challenge:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID del challenge
 *                     title:
 *                       type: string
 *                       description: Título del challenge
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array actualizado de participantes
 *       400:
 *         description: Datos inválidos en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Se requiere userId y challengeId"
 *       404:
 *         description: Challenge o usuario no encontrado
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
 *                   example: "Error al añadir al participante"
 */
router.put('/addParticipant/:userId/:challengeId', addParticipant);

/**
 * @swagger
 * /api/challenges/removeParticipant/{userId}/{challengeId}:
 *   put:
 *     summary: Eliminar un participante de un challenge
 *     tags: [Challenge]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario a eliminar del challenge
 *       - in: path
 *         name: challengeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del challenge del cual eliminar el participante
 *     responses:
 *       200:
 *         description: Participante eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                   example: "Participante eliminado exitosamente"
 *                 challenge:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID del challenge
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array actualizado de participantes
 *       404:
 *         description: Challenge o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró el challenge o el usuario"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al eliminar el participante"
 */
router.put('/removeParticipant/:userId/:challengeId', removeParticipant);

/**
 * @swagger
 * /api/challenges/{id}:
 *   delete:
 *     summary: Eliminar un challenge
 *     tags: [Challenge]
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
router.delete('/delete/:challengeId', deleteChallenge);

export default router;