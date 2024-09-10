import express from 'express'
import { authMiddleware } from '../middleware/protectRoute.js';
import { getUser , updateUser } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/profile/:userId', authMiddleware, getUser)
router.put('/profile', authMiddleware,  updateUser)



export default router;