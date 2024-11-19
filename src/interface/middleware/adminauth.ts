import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {userModel} from "../../infrastructure/database"
export const adminauth = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    console.error("JWT_ACCESS_SECRET is not set in environment variables");
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  try {
    console.log("Token to verify:", token);
    console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);
     
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as {email:string};
    console.log("Decoded token:", decode);

    const admin = await userModel.findOne({email: decode.email});

    if (admin?.is_admin === false) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};