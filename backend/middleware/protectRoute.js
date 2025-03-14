import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

//ensures that only authenticated users (users with a valid token) can access certain routes.
//verifying if  a JSON Web Token (JWT) is  stored in a cookie.
export const protectRoute = async (req, res, next ) => {

    try {
        const token = req.cookies.jwt; //using cookie parser to get cookie from user request
        if(!token) {
            return res.status(401).json({error: "Unauthorized: Token not provided. Check if you are logged in!"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //decode token with secret word we used to encode it

        if(!decoded) {
            return res.status(401).json({error:"Uauthorized: token not provided!"});
        }

        const user = await User.findById(decoded.userId).select("-password"); //use user id that we encoded in the payloud to get the user from database
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        req.user = user;  //If the user is authenticated, attach the user's information to the request object (req.user) to make it avalinble to next function/route and allow the request to proceed.
        next();
        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
    }

}