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
exports.agentauth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../infrastructure/database");
const agentauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.cookies.agentToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
    if (!process.env.JWT_ACCESS_SECRET) {
        return res.status(401).json({ success: false, message: "The token is not secured" });
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = yield database_1.agentModel.findOne({ email: decode.email });
        if (!user) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: "The token is not validated" });
    }
});
exports.agentauth = agentauth;
