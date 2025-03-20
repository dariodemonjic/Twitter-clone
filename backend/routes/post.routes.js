import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {createPost, deletePost, commentPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts} from "../controllers/post.controller.js"

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.post("/likedPosts/:id", protectRoute, getLikedPosts);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/all", protectRoute, getAllPosts);
router.post("/following", protectRoute, getFollowingPosts);


export default router;