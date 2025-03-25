import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import NotificationRoutes from "./routes/notification.route.js"
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import cors from "cors";




dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", NotificationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();

})