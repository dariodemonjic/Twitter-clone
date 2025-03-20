import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

export const getUserProfile =  async (req, res) =>{
    const {username} = req.params;
    try {
        
        const user = await User.findOne({username}).select("-password");
        if(!user) return res.status(404).json({message: "User not found"});
        
        res.status(200).json(user);
 
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in USER PROFILE");
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id); //ID is in reaquest because of middlewave protectRoute function

        if(id === req.user._id.toString()) return res.status(400).json({ error: "You cant follow or unfollow yourself"});
        if (!userToModify || !currentUser) res.status(400).json({error: "User not found"});

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate(id, {$pull : {followers: req.user._id} });
            await User.findByIdAndUpdate(req.user._id, {$pull : {follwing: id} });

            //send id later to frontend

            res.status(200).json({message: "User unfollowed succuessfully"});
            

        }else{
            //follow
            await User.findByIdAndUpdate(id, {$push : {followers: req.user._id}}); //update followers on userToBeFollowed
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}}); //update following on current user

            const newNotification = new Notification({
                type:"follow",
                from:req.user._id,
                to:userToModify._id, //could just put id,  more readable this way

            })

            await newNotification.save();
            //todo think of  returning id of the user as response, will be helpful in frontend
            res.status(200).json({message: "User followed succuessfully"});
        }

        
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in FOLLOW UNFOLLOW USER");
    }
}

export const getSuggestedUsers =  async (req, res) => { 
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate ([ //get all users expect me :(
                {
                $match : {
                _id: {$ne:userId} //NOT EQUAL TO 
                }
            },
            {$sample:{size:10}}  
        ])
        const filteredUsers = users.filter(user=> !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach ( user =>  user.password = null ) //remove sensitive data (Password) so its is not send to the client 
        
        res.status(200).json(suggestedUsers);
        
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({error: error.message});
        
    }

}

export const updateUserProfile =  async (req, res ) => { 
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"});

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Please provide both current and new password"});
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password); 
            if(!isMatch) return res.status(400).json({error:"Current passwrod is incorrect"});
            if(newPassword.length < 6 ) {
                return res.status(400).json({error:"Passwrod must be at least 6 charatcers long"});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        //add email check logic later

        if(profileImg) {

            if(user.profileImg){
                cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); //prob can be done smoother
            } 
           const uploadedResponse = await cloudinary.uploader.upload(profileImg) ; 
            profileImg = uploadedResponse.secure_url;
            
        }
        if(coverImg) { 
            if(user.coverImg){
                cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); 
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg) ; 
            coverImg = uploadedResponse.secure_url;
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        await user.save();
        user.password = null;

        return res.status(200).json({user})


        
    } catch (error) {
        res.status(500).json({error: error.message});
        
    }


}