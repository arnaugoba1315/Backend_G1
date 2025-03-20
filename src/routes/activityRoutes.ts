import express from 'express';
import * as activityController from '../controllers/activityController';

const router = express.Router();

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new activity associated with a user
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - startTime
 *               - endTime
 *               - duration
 *               - distance
 *               - averageSpeed
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user who created the activity
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               distance:
 *                 type: number
 *               averageSpeed:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [running, cycling, hiking, walking]
 *     responses:
 *       201:
 *         description: Activity created successfully
 */
router.post('/', activityController.createActivityHandler);

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get an activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity details
 *       404:
 *         description: Activity not found
 */
router.get('/:id', activityController.getActivityByIdHandler);

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get all activities by user ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/user/:userId', activityController.getActivitiesByUserIdHandler);

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of all activities
 */
router.get('/', activityController.getAllActivitiesHandler);

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update an activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               distance:
 *                 type: number
 *               elevationGain:
 *                 type: number
 *               averageSpeed:
 *                 type: number
 *               caloriesBurned:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [running, cycling, hiking, walking]
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Error updating activity
 */
router.put('/:id', activityController.updateActivityHandler);

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete an activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Error deleting activity
 */
router.delete('/:id', activityController.deleteActivityHandler);

export default router;
