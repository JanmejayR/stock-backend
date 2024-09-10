import dotenv from 'dotenv'
dotenv.config();
import jwt from 'jsonwebtoken'

export const authMiddleware = async(req,res,next)=>{
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'authentication failed, no token found' });

    try{
        
        const decodedToken =  jwt.verify(token, process.env.JWT_SECRET);
        // to authenticate user later on
        req.user = decodedToken;

        console.log("user authenticated")
        next();

    }catch(error){
        console.log(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
}