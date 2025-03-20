import express from 'express';
import * as referencePointController from '../controllers/referencePointController';

const router = express.Router();

/**
 * @swagger
 * /api/referencepoints:
 *   post:
 *     summary: Create a new reference point
 *     tags: [ReferencePoints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activity
 *               - latitude
 *               - longitude
 *               - timestamp
 *             properties:
 *               activity:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               altitude:
 *                 type: number
 *               heartRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reference point created successfully
 *       500:
 *         description: Error creating reference point
 */
router.post('/', referencePointController.addReferencePointHandler);


/**
 * @swagger
 * /api/referencepoints/{id}:
 *   get:
 *     summary: Get a reference point by ID
 *     tags: [ReferencePoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reference Point ID
 *     responses:
 *       200:
 *         description: Reference point data
 *       404:
 *         description: Reference point not found
 *       500:
 *         description: Error fetching reference point
 */
router.get('/:id', referencePointController.getReferencePointByIdHandler);

/**
 * @swagger
 * /api/referencepoints/{id}:
 *   put:
 *     summary: Update a reference point
 *     tags: [ReferencePoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reference Point ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               altitude:
 *                 type: number
 *               heartRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reference point updated successfully
 *       404:
 *         description: Reference point not found
 *       500:
 *         description: Error updating reference point
 */
router.put('/:id', referencePointController.updateReferencePointHandler);

/**
 * @swagger
 * /api/referencepoints/{id}:
 *   delete:
 *     summary: Delete a reference point
 *     tags: [ReferencePoints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reference Point ID
 *     responses:
 *       200:
 *         description: Reference point deleted successfully
 *       404:
 *         description: Reference point not found
 *       500:
 *         description: Error deleting reference point
 */
router.delete('/:id', referencePointController.deleteReferencePointHandler);

/**
 * @swagger
 * /api/referencepoints/activity/{activityId}:
 *   get:
 *     summary: Get all reference points for an activity
 *     tags: [ReferencePoints]
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: List of reference points
 *       500:
 *         description: Error fetching reference points
 */
router.get('/activity/:activityId', referencePointController.getReferencePointsByActivityHandler);

export default router;
