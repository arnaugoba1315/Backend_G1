import express from 'express';
import * as referencePointController from '../controllers/referencePointController';

const router = express.Router();

/**
 * @openapi
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
 *               - latitude
 *               - longitude
 *               - altitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               altitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reference point created successfully
 *       500:
 *         description: Error creating reference point
 */
router.post('/', referencePointController.addReferencePointController);


/**
 * @openapi
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
router.get('/:id', referencePointController.getReferencePointByIdController);

/**
 * @openapi
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
 *               altitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reference point updated successfully
 *       404:
 *         description: Reference point not found
 *       500:
 *         description: Error updating reference point
 */
router.put('/:id', referencePointController.updateReferencePointController);

/**
 * @openapi
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
router.delete('/:id', referencePointController.deleteReferencePointController);

export default router;
