import mongoose from "mongoose";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => { 
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to:userId})
        .sort({createdAt: -1})
        .populate({
            path: "from",
            select: "username profileImage"
        })
       
        await Notification.updateMany({to:userId}, {read:true}) //update notification read status to true
        res.status(200).json(notifications)
        
        
    } catch (error) {
        console.log("Error in getnotifications in Notification controller");
        res.status(500).json({error: "Internal server error"});
    }

}


export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notifcation.deleteMany({to: userId});
        res.status(200).json({message: "Notifications deleted successfully"})
        
    } catch (error) {
        console.log("Error in getnotifications in Notification controller");
        res.status(500).json({error: "Internal server error"});
    }

}