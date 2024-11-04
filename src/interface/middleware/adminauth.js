"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminauth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../infrastructure/database");
const adminauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log("Decoded token:", decode);
        const admin = yield database_1.userModel.findOne({ email: decode.email });
        if ((admin === null || admin === void 0 ? void 0 : admin.is_admin) === false) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.adminauth = adminauth;
