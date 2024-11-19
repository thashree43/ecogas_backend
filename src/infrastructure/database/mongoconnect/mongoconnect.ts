import mongoose from "mongoose";
require("dotenv").config();

const mongoURL = process.env.MONGO_URL as string;

export const connectDb = async () => {
    try {
        await mongoose.connect(mongoURL, {
          
            serverSelectionTimeoutMS: 5000,  // Timeout after 5s
            socketTimeoutMS: 45000, // Timeout after 45s of inactivity
        });
        console.log("MongoDB has been connected");
    } catch (error) {
        console.error("Error while connecting to MongoDB", error);
    }
};
