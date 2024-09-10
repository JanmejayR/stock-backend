import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
dotenv.config();
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit';
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import { connectToDB } from './database/db.js';

const app = express();

const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limiting each ip addresss to 100 requests in 15 minutes to prevent api abuse
    message: 'Too many requests from this IP, please try again later.',
  });

app.use(globalRateLimiter)
app.use(express.json())
app.use(cors());// allowing all origins for testing
const server = http.createServer(app);
export const io = new Server(server,  {
    cors: {
        origin: "*", // Allowing all origins for testing
        methods: ["GET", "POST"]
    }
}); 

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('newComment', (data) => {
        console.log('New comment:', data);
        io.emit('updateComments', data);
    });

    socket.on('likePost', (data) => {
        console.log('Post liked:', data);
        io.emit('updateLikes', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


app.use('/api/auth' , authRoutes);
app.use('/api/user' , userRoutes);
app.use('/api/posts' , postRoutes);

server.listen(process.env.PORT , ()=>{
    console.log(`server running on port ${process.env.PORT}`)
    connectToDB();
})