import mongoose from "mongoose";
import dotenv from "dotenv";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`Error connecting to to mongoDB: ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB