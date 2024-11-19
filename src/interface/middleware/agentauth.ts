import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { agentModel } from "../../infrastructure/database";

export const agentauth = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.agentToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(401).json({ success: false, message: "The token is not secured" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as { email: string };

    const user = await agentModel.findOne({ email: decode.email });

    if (!user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "The token is not validated" });
  }
};