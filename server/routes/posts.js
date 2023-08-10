import express from "express";

import { getPosts,getPost,getPostsBySearch,createPost,updatePost,deletePost,likePost } from "../controllers/posts.js";
import auth from '../middleware/auth.js';

const router = express.Router();

// http://localhost:5000/posts

router.get('/:id', getPost);
router.get('/search', getPostsBySearch);
router.get('/', getPosts );
router.post('/',auth, createPost );
router.patch('/:id',auth, updatePost);
router.delete('/:id',auth, deletePost);
router.put('/:id/likePost',auth, likePost);


export default router;
