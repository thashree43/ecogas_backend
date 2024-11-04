import jwt, { SignOptions } from "jsonwebtoken";
require("dotenv").config();

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets (access/refresh) are not set in environment variables");
}

export const generatetoken = (payload: { id: string; email: string }, options?: SignOptions): string => {
    return jwt.sign(payload, accessSecret, {
        ...(options || {}),
        expiresIn: '1h', 
    });
};

export const generateRefreshToken = (payload: { id: string; email: string }, options?: SignOptions): string => {
    return jwt.sign(payload, refreshSecret, {
        ...(options || {}),
        expiresIn: '7d', 
    });
};
