import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    stockSymbol:{
        type : String,
        required : true,
    },
    title:{
        type : String,
        required : true,
    },
    description:{
        type : String,
        required: true,
    },
    tags:[{
        type: String,
        default: [],
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
   
    
})



 const Post = mongoose.model('Post' , postSchema);
 export default Post;