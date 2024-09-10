
import Post from '../models/post.model.js'
import Comment from '../models/comment.model.js';
import { io } from '../server.js';
import mongoose from 'mongoose'

export const createPost = async(req,res)=>{
   
    const { stockSymbol , title , description , tags } = req.body;

    try{
        if(!stockSymbol || !title || !description ){
            throw new Error("Please enter data in all required fields")
        }

        if (tags && typeof tags !== 'object') {
            return res.status(400).json({ message: 'Tags should be an array of strings' });
        }

        const userId = req.user.id;

        const newPost = new Post ({
            user: userId,
            stockSymbol,
            title,
            description,
            tags
        })

        await newPost.save();
        const postId = newPost._id;
        res.status(201).json({ success: true, postId, message: 'Post created successfully' })

    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in create post controller" , error: error.message})
    }
    
}

export const getPost = async(req,res)=>{
    const { postId } = req.params;

    try{
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }
        
        const post = await Post.findById(postId).select('stockSymbol title description likes createdAt')

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comments = await Comment.find({ post: postId }).select('user comment createdAt')

        const formattedComments = comments.map((comment) => ({
            commentId: comment._id,
            userId: comment.user,
            comment: comment.comment,
            createdAt: comment.createdAt,
        }));


        const response = {
            postId,
            stockSymbol: post.stockSymbol,
            title: post.title,
            description: post.description,
            likesCount: post.likes.length, // Assuming `likes` is an array of users who liked the post
            comments: formattedComments,
        };
        res.status(200).json(response)
        return;
    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in get post controller" , error: error.message})
    }
}

export const getAllPosts = async(req,res)=>{
    //assuming tags is a string of comma separated tags
    const { stockSymbol, tags, sortBy, page=1 , limit=10 } = req.query;
    try{

        const filter = {}
        const sort = {}

        if(stockSymbol) filter.stockSymbol = stockSymbol;
        if (tags && tags.length > 0) {
            // to trim spaces and removing empty '' filters
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (tagsArray.length > 0) {
              filter.tags = { $in: tagsArray };
            }
        }
        if (sortBy) {
            if (sortBy === 'date') {
                sort.createdAt = -1; 
            } else if (sortBy === 'likes') {
                sort.likes = -1; 
            }
        }


        // pagination implemented
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        const posts = await Post.find(filter).sort(sort).skip(skip).limit(pageSize).select('_id stockSymbol title description likes createdAt')
        const formattedPosts = posts.map(post => ({
            postId: post._id,
            stockSymbol: post.stockSymbol,
            title: post.title,
            description: post.description,
            likesCount: post.likes.length,
            createdAt: post.createdAt
        }));


        const totalCount = await Post.countDocuments(filter);

        const pagination = {
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: pageNumber,
            pageSize
        };

        res.status(200).json({posts: formattedPosts , pagination });


    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in get All posts controller" , error: error.message})
    }

   
}



export const deletePost = async(req,res)=>{
    const { postId }= req.params;    

    try{
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const result = await Post.findByIdAndDelete(postId);
        if (!result) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Return success response
        res.status(200).json({ success: true, message: 'Post deleted successfully' });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in delete post controller" , error: error.message})
    }
}

export const likePost = async(req,res)=>{
    const { postId } = req.params;

    try{
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const userId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found for given postId' });
        }

        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Post already liked by the user' });
        }

        post.likes.push(userId);

        await post.save();

        io.emit('updateLikes', {
            postId,
            userId,
            likesCount: post.likes.length
        });

       
        res.status(200).json({ success: true, message: 'Post liked' });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in like post controller" , error: error.message})
    }


}

export const unlikePost = async(req,res)=>{
    const { postId } = req.params;

    try{
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const userId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found for given postId' });
        }

        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Post already not liked by the user' });
        }

        post.likes = post.likes.filter((id)=>{id!==userId})

        await post.save();

       
        
        res.status(200).json({ success: true, message: 'Post unliked' });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in unlike post controller" , error: error.message})
    }
}

export const addComment = async(req,res)=>{
    const { postId } = req.params;
    const { comment } = req.body;
    try{
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }
        if(!comment ){
            return res.status(400).json({ message: 'no comment content found' });
        }
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found for given postId' });
        }
        const newComment = new Comment({
            user: userId,
            post: postId,
            comment
        })
        await newComment.save();
        const commentId = newComment._id

        io.emit('updateComments', {
            commentId,
            postId,
            userId,
            comment,
            createdAt: newComment.createdAt
        });

        res.status(201).json({success: true, commentId, message: 'Comment added successfully'})
        

    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in add Comment controller" , error: error.message})      
    }
}

export const deleteComment = async(req,res)=>{
    const { postId , commentId } = req.params;
    
    try{
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: 'Invalid comment ID' });
        }
        
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found for given postId' });
        }

        const comment = await Comment.findOne({ _id: commentId, post: postId });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId)

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });


    }catch(error){
        console.log(error);
        res.status(500).json({message: "error in delete Comment controller" , error: error.message})      
    }
}


