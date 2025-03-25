import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    }, 
    fullname:{
        type:String,
        required:true,
        alias: "fullName"  // Now accepts both spellings
    },
    password:{
        type:String,
        required:true,
        minLength:6,
    }, 
    email:{
        type:String, 
        required:true,
        unique:true
    },
    followers: [
        {
            type:mongoose.Schema.Types.ObjectId, 
            ref:"User" ,//reference to user model, follower will be userId,
            default: []
        }
    ],
    following: [
        {
            type:mongoose.Schema.Types.ObjectId, 
            ref:"User" ,//reference to user model, follower will be userId,
            default: [],
        }
    ],
    profileImage:{
        type:String,
        default: "",

    },
    coverImg : {
        type:String,
        default:"",
    },
    bio:{
        type:String,
        defalt: "",
    }, 
    link:{
        type:String,
        default:"",
    },
    likedPosts: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default : []

        }
    ]



}, {timestamps: true})

const User = mongoose.model("User", userSchema);


export default User;