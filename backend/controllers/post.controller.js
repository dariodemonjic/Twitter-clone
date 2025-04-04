import mongoose from "mongoose";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from 'cloudinary';
import Notification from "../models/notification.model.js";

 
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

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) return res.status(400).json({ error: "Text field is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = { user: userId, text: text };
        post.comments.push(comment);
        await post.save();

        // Populate the user details in the last comment (the one we just added)
        const populatedPost = await Post.findById(postId).populate({
            path: 'comments.user',
            select: '_id username fullName profileImg' // Only include necessary fields
        });

        // Get the last comment (the newly added one)
        const newComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.status(200).json(newComment); // Send back just the new comment with user details

    } catch (error) {
        console.log("Error in commentPost in Post controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const getAllPosts = async (req, res) => {
     try {

        const posts = await Post.find().sort({createdAt: -1}).populate({ //.populate("user").select(-password) doesnt work so have to do it like this
            path:"user",
            select: "-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        
        //latest post at the top, get all info from user with populate so we can use username profile img in our frontend
        //replace that user ID in the Posts collection with the full user information from the Users collection with POPULATE
        if(posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
        
     } catch (error) {
        console.log("Error in getAllPosts in Post controller");
        res.status(500).json({error: "Internal server error"});
     }

}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if(!user) return res.status(400).json({error: error.message});
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})  //if post id included in userlikedposts (where post ids are) then get it
        .populate({
            path: "user", 
            select:"-password"
        })
        .populate({
            path: "comments.user", 
            select: "-password"
        })

        return res.status(200).json(likedPosts);

        
    } catch (error) {
        console.log("Error in getLiekdPosts in Post controller");
        res.status(500).json({error: "Internal server error"});
    }

}

export const getFollowingPosts = async (req, res ) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(400).json({error: error.message});
        const followingPosts = await Post.find({user: { $in: user.following }}) //GET POSTS WHERE USER ID FROM POST EQUALS TO ID IN USER.FOLLOWING
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user", 
            select: "-password",
        })

        res.status(200).json(followingPosts);
        
    } catch (error) {
        console.log("Error in getFollowingPosts in Post controller");
        res.status(500).json({error: "Internal server error"});
    }
}

export const getUserPosts =  async (req, res) => {
    try {
        const {username} = req.params;
       
        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({error: "User not found"});

        const posts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user", 
            select: "-password"
        })

        res.status(200).json(posts);
        
    } catch (error) {
        console.log("Error in getUserPosts in Post controller");
        res.status(500).json({error: "Internal server error"});
    }

}