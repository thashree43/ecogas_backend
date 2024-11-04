import {Request,Response, NextFunction } from "express";
import jwt  from "jsonwebtoken";
import { userModel } from "../../infrastructure/database";

export const userauth = async(req:Request,res:Response,next:NextFunction)=>{

    let token = req.cookies.userToken
    
    if(!token){
        return res.status(401).json({ success: false, message: "No token provided" });
        
    }
    
    if(!process.env.JWT_ACCESS_SECRET){
        return res.status(401).json({ success: false, message: "the token is not secured " });
    }  

    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as {email:string};

    if(!decode){
        return res.status(401).json({ success: false, message: "the token is not validated " });
    }

    const user = await userModel.find({email:decode.email})

    if(!user){
        return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    next();

}

