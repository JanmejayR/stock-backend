import express from 'express'
import { authMiddleware } from '../middleware/protectRoute.js';
import { createPost , getPost , getAllPosts , deletePost, likePost, unlikePost, addComment, deleteComment} from '../controllers/post.controller.js';
const router = express.Router();

router.post('/:postId/like' , authMiddleware, likePost);
router.delete('/:postId/unlike' , authMiddleware, unlikePost);

router.post('/:postId/comments' , authMiddleware, addComment)
router.delete('/:postId/comments/:commentId' , authMiddleware, deleteComment)

router.post('/' , authMiddleware , createPost);
router.get('/:postId' , authMiddleware , getPost)
router.get('/' , authMiddleware , getAllPosts)
router.delete('/:postId' , authMiddleware , deletePost)


export default router;