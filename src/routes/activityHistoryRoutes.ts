import express from 'express';
import * as activityHistoryController from '../controllers/activityHistoryController';

const router = express.Router();

/**
 * @openapi
 * /api/activity-history/activity/{activityId}:
 *   get:
 *     summary: Get activity history by activity ID
 *     tags: [ActivityHistory]
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Activity history data
 *       500:
 *         description: Server error
 */
router.get('/activity/:activityId', activityHistoryController.getHistoryByActivityIdController);

/**
 * @openapi
 * /api/activity-history:
 *   get:
 *     summary: Get all activity history entries
 *     tags: [ActivityHistory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Activity history data
 *       500:
 *         description: Server error
 */
router.get('/', activityHistoryController.getAllActivityHistoryController);

/**
 * @openapi
 * /api/activity-history/search:
 *   post:
 *     summary: Search activity history
 *     tags: [ActivityHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: object
 *               userId:
 *                 type: string
 *               changeType:
 *                 type: string
 *                 enum: [create, update, delete]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results
 *       500:
 *         description: Server error
 */
router.post('/search', activityHistoryController.searchActivityHistoryController);

/**
 * @openapi
 * /api/activity-history/{id}:
 *   delete:
 *     summary: Delete activity history entry
 *     tags: [ActivityHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History entry ID
 *     responses:
 *       200:
 *         description: History entry deleted
 *       404:
 *         description: History entry not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', (req, res) => {
    activityHistoryController.deleteActivityHistoryController(req, res);
  });
  

export default router;