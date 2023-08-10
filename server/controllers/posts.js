import express, { response } from 'express';
import mongoose from 'mongoose';

import PostMessage from '../models/postMessage.js';

const router = express.Router();

export const getPost = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPosts = async (req, res) => { 
    const {page} = req.query;
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT;

        const total = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
                
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getPostsBySearch = async (req,res) => {
    const { searchQuery, tags } = req.query;
    try {
        const title = new RegExp(searchQuery, "i");

        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});
        res.json({ data: posts });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req,res) => {
    const post = req.body;
    const newPost = new PostMessage({...post, creator: req.userId, createdAt: new Date().toISOString()});
    try {
       await newPost.save();
       
       res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
};

export const updatePost = async (req,res) => {
    const { id } = req.params;
    const post = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No post with id");

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
};

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No post with id");

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}  

export const likePost = async (req, res) => {
    try {

    
    const { id } = req.params;

    if(!req.userId) return res.json({ message: 'Unauthenticated '});

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    //const index = post.likes.includes((id) => id == req.userId);

    // if(!index){
    //    post.likes.push(req.userId);
    // } else {
    //     post.likes = post.likes.filter((id) => id !== req.userId);
    // }

    // const updatedPost = await PostMessage.findByIdAndUpdate(id , post , { new: true });
    
    // res.status(200).json(updatedPost);

    if (!post.likes.includes(req.userId)) {
        await post.updateOne({ $push: { likes: req.userId } });
        res.status(200).json({post,message: "post has been liked"});
      } else {
        await post.updateOne({ $pull: { likes: req.userId } });
        res.status(200).json({post,message: "post has been disliked"});
      }

} catch (error) {
    console.log(error);
    res.status(500).json(error);
}
}

export default router;





