import mongoose from "mongoose";
import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import {v2 as cloudinary} from 'cloudinary'
 
export const createPost = async (req, res) => { 
    try {
        const {text} = req.body;
        let {img} = req.body; //gonna change to secure later so thats why let
        const userId = req.user._id.toString(); 

        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(404).json({error: error.message});

        if(!text && !img) return res.status(400).json({error: "Post must game text or an image!"});

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img) ; 
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text:text,
            img:img
        });

        await newPost.save();
        res.status(201).json({newPost});

        
        
    } catch (error) {
        console.log("Error in post controller");
        res.status(500).json({error: error.message});
        
    }

}

export const deletePost = async (req, res ) => {

    try {
        const postId = req.params.id; 
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if(!post) return res.status(400).json({error: "Post not found"});

        if(post.user.toString() !== userId.toString()) return res.status(401).json({error: "You are not authorized to delete this post!"})
        
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0]
           await cloudinary.uploader.destroy(imgId); //destory image from cloudinary to save space
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({message: "Post deleted successfully!"});

    } catch (error) {
        console.log("Error in delete post from POST CONTROLLER")
        res.status(500).json({error: "Internal server error"});
        
    }
    
  




}