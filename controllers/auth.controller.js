import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { z } from 'zod';

const registerSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password should be at least 6 characters long")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password should be at least 6 characters long")
});


export const userRegister = async(req,res)=>{
    const { username, email, password } = req.body; 
    try{

        registerSchema.parse({ username, email, password });
        const existingUser = await User.findOne({email});

        if(existingUser)return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await new User({username,email, password: hashedPassword }).save();
   


        res.status(201).json({ success: true, message: 'User registered successfully', userId: user._id});
    }catch(error){

        if (typeof error === 'object' && error.errors && typeof error.errors === 'object') {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Error in Register Controller' } , error);
    }
    
}

export const userLogin = async(req,res)=>{
    const { email, password } = req.body;

    try{

        loginSchema.parse({ email, password });
        const registeredUser = await User.findOne({email});

       
    
        if(!registeredUser){
            return res.status(400).json({ message: 'User has not registered yet' });
        }

        const isMatched = await bcrypt.compare(password, registeredUser.password);

        if(!isMatched){
            return res.status(400).json({ message: 'wrong Password' });
        }
        

        const token = jwt.sign({id: registeredUser._id} , process.env.JWT_SECRET , { expiresIn: '1h' });

        if(!token){
            throw new Error('jwt token generation failed');
        }

        res.status(200).json({ token, user: { id: registeredUser._id, email: registeredUser.email, username: registeredUser.username } });


    }catch(error){
        console.log("error " , error);

        if (typeof error === 'object' && error.errors && typeof error.errors === 'object') {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Error in Login Controller' , error: error.message } );
    }
}


