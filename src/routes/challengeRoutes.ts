import {Router} from 'express';
import { createChallenge, getChallengeById, getAllChallenges, updateChallenge, deleteChallenge, getActiveChallenges, addParticipant, removeParticipant } from '../controllers/challengeController';
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
responses:
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
router.post('/challenge', createChallenge);
router.get('/challenge/:id', getChallengeById);
router.get('/challenges', getAllChallenges);
router.put('/challenge/:id', updateChallenge);
router.delete('/challenge/delete/:id', deleteChallenge);
router.get('/challenges/active', getActiveChallenges);
router.get('/challenges/inactive', getAllChallenges);
router.put('/challenge/addParticipant/:userId/:challengeId', addParticipant);
router.put('/challenge/removeParticipant/:userId/:challengeId', removeParticipant);

export default router;