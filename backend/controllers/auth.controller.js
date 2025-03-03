
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../libs/utils/generateToken.js';

export const signup = async (req, res ) =>{
    try {
        const {fullname, username, email, password} = req.body;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({error: "Invalid email format"});   
        }

        const existingUser = await User.findOne({username}) // ({username:username}) same syntax , just shortented it
        if(existingUser){
            return res.status(400).json({error: "Username is already taken"});
        }

        const existingEmail = await User.findOne({email}) // ({username:username}) same syntax , just shortented it
        if(existingEmail){
            return res.status(400).json({error: "Email is already taken"});
        }
        
        if(password.length <6){
            return res.status(400).json({error:"Password must be atleast 6 characters long"})
        }

        //hash password using becrypt package
        const salt = await bcrypt.genSalt(10) //takes a bit of time
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        })
        console.log("USERDATA",newUser);
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email:newUser.email,
                followers: newUser.followers,
                following: newUser.following, 
                profileImg: newUser.profileImg, 
                coverImg: newUser.coverImg,

            })
        }else{
            res.status(400).json({error:"Invalid user data"}); 
        }
        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
    }

}

export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); //if empty comapre with string, if unefiened will get and error
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"});
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email:user.email,
            followers: user.followers,
            following: user.following, 
            profileImg: user.profileImg, 
            coverImg: user.coverImg,

        });
        
        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
    }
}

export const getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);

        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
    }
}