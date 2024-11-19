// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// interface CustomRequest extends Request {
//   user?: jwt.JwtPayload;
// }

// const authenticateToken = (adminOnly: boolean = false, allowUnauthenticated: boolean = false) => 
//   (req: CustomRequest, res: Response, next: NextFunction) => {
//     let token: string | undefined;

//     // Check for token in cookies
//     if (req.cookies) {
//       token = req.cookies.adminToken || req.cookies.userToken || req.cookies.agentToken;
//     }

//     // // If not in cookies, check Authorization header
//     // if (!token && req.headers.authorization) {
//     //   const parts = req.headers.authorization.split(' ');
//     //   if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
//     //     token = parts[1];
//     //   }
//     // }

//     console.log("Token for authentication:", token);

//     if (!token) {
//       if (allowUnauthenticated) {
//         return next(); 
//       }
//       return res.status(401).json({ success: false, message: "Not authenticated, no token provided" });
//     }

//     const jwtSecret = process.env.JWT_ACCESS_SECRET;
//     if (!jwtSecret) {
//       console.error("JWT_SECRET is not set in environment variables");
//       return res.status(500).json({ success: false, message: "Internal server error." });
//     }

//     jwt.verify(token, jwtSecret, (err, decoded) => {
//       if (err) {
//         if (allowUnauthenticated) {
//           return next(); 
//         }
//         return res.status(403).json({ success: false, message: "Invalid token." });
//       }

//       if (!decoded || typeof decoded === "string") {
//         return res.status(403).json({ success: false, message: "Invalid token format." });
//       }

//       if (adminOnly && !decoded.is_admin) {
//         return res.status(403).json({ success: false, message: "Admin access required." });
//       }
//       console.log("the rithas data",req.user);
//       req.user = decoded;
//       console.log(req.user,"the rithas data");
      
//       next();
//     });
//   };

// export default authenticateToken;
