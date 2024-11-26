import express from 'express';
import { createUser, getUserInfo, updateUser } from '../controllers/userController.js';
import { authenticateBasicAuth, blockUnverifiedUsers } from '../middleware/middlewareAuthentication.js';
import { verifyUser } from '../controllers/verifyController.js';


const userRoutes = express.Router();

userRoutes.post('/v1/user', createUser);
userRoutes.get('/v1/user/self', authenticateBasicAuth, blockUnverifiedUsers, getUserInfo);
userRoutes.put('/v1/user/self', authenticateBasicAuth, blockUnverifiedUsers, updateUser);



userRoutes.get('/verify', verifyUser);


export default userRoutes;
