


# Installation and Setup 

1. Clone the repository:

   ```bash
   git clone https://github.com/JanmejayR/stock-backend.git
   ```


2. Install dependencies:
```bash
  cd stock-backend
  npm install
   ```

## Environment Variables
Create a .env file in the root directory and add the following environment variables. Port is where server will run, MONGO_URI is the mongodb connection string, and JWT_SECRET is a secure string to generate a secure json web token:
(you can open git bash and type 'openssl rand -base64 32' to generate a secure JWT_SECRET)
```bash
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret 
```

# Running the Application
To start the server, use: 
```bash
npm run start
```

# API Endpoints
### Import the stock-backend.postman_collection.json file in postman to test the endpoints. To see updates from socket.io, open the sockettest.html file in any browser and open the browser console. If there is any request from postman about adding a new comment or liking it, the html file's browser console will receive live updates.


## Auth Routes
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/auth/register` | Register a new user    |
| POST   | `/api/auth/login`    | Login an existing user |

make sure that password length is atleast six characters, other checks are basic and can be found in their respective controller functions

## User Routes

| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | `/api/user/profile/:userId` | Get user profile information   |
| PUT    | `/api/user/profile`         | Update user profile            |

## Post Routes

pagination has been implemented  for /api/posts get request, here is an example of a request containing pagination parameters for idea :- 
```bash
http://localhost:3000/api/posts?tags=payment,money,bank&sortBy=date&page=1&limit=1
```

| Method  | Endpoint                              | Description                                 |
|---------|---------------------------------------|---------------------------------------------|
| POST    | `/api/posts`                          | Create a new post                           |
| GET     | `/api/posts/:postId`                  | Get a specific post                         |
| GET     | `/api/posts`                          | Get all posts                               |
| DELETE  | `/api/posts/:postId`                  | Delete a post                               |
| POST    | `/api/posts/:postId/like`             | Like a post                                 |
| DELETE  | `/api/posts/:postId/unlike`           | Unlike a post                               |
| POST    | `/api/posts/:postId/comments`         | Add a comment to a post                     |
| DELETE  | `/api/posts/:postId/comments/:commentId` | Delete a comment from a post                |

