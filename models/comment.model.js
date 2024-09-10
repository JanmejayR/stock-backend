import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    comment:{
        type: String,
        required: true,
    },
    createdAt: {  //this would be useful if we want to filter by latest comments
        type: Date,
        default: Date.now
      }
})

const Comment = mongoose.model('Comment' , commentSchema);
export default Comment;