import {Router} from 'express';

const router = Router();

router.post('/challenge', createChallenge);
router.get('/challenge/:id', getChallengeById);
router.get('/challenges', getAllChallenges);
router.put('/challenge/:id', updateChallenge);
router.delete('/challenge/delete/:id', deleteChallenge);
router.get('/challenges/active', getActiveChallenges);
router.get('/challenges/inactive', getAllChallenges);
router.put('/challenge/addParticipant/:userId/:challengeId', addParticipant);
router.put('/challenge/removeParticipant/:userId/:challengeId', removeParticipant);
