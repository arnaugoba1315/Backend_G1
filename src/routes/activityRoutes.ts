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
 *               - author
 *               - name
 *               - startTime
 *               - endTime
 *               - duration
 *               - distance
 *               - elevationGain
 *               - averageSpeed
 *               - route
 *               - type
 *             properties:
 *               author:
 *                 type: objectId
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
 *               elevationGain:
 *                 type: number
 *               averageSpeed:
 *                 type: number
 *               route:
 *                 type: array
 *                 items: 
 *                   referencePoint:
 *                     type: objectId
 *               type:
 *                 type: string
 *                 enum: [running, cycling, hiking, walking]
 *     responses:
 *       201:
 *         description: Activity created successfully
 */
router.post('/', activityController.createActivityController);

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
router.get('/:id', activityController.getActivityByIdController);

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
router.get('/user/:userId', activityController.getActivitiesByUserIdController);

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
router.get('/', activityController.getAllActivitiesController);

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
 *               route:
 *                 type: array
 *                 items: 
 *                   referencePoint:
 *                     type: objectId
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
router.put('/:id', activityController.updateActivityController);

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
router.delete('/:id', activityController.deleteActivityController);

export default router;
