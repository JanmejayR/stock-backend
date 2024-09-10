import User from "../models/user.model.js";
import mongoose from 'mongoose'
export const getUser = async(req,res)=>{
    const{ userId }= req.params;

    try{

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found for given id' });
        }

        const { _id, username, bio, profilePicture } = user;
        res.status(200).json({ id: _id, username, bio, profilePicture})

    }catch(error){
        console.log("error " , error);
        res.status(500).json({ message: 'Error in getUser Controller' , error: error.message } );
    }
}

export const updateUser = async(req,res)=>{
    const { username, bio, profilePicture } = req.body;
    const userId = req.user.id;
    
    try{
        if (!username && !bio && !profilePicture) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found for given id' });
        }
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;

        
        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated' });
      

    }catch(error){
        console.log("error " , error);
        res.status(500).json({ message: 'Error in updateUser Controller' , error: error.message } );
    }

}