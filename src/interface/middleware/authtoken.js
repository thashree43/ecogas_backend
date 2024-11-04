"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generatetoken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets (access/refresh) are not set in environment variables");
}
const generatetoken = (payload, options) => {
    return jsonwebtoken_1.default.sign(payload, accessSecret, Object.assign(Object.assign({}, (options || {})), { expiresIn: '1h' }));
};
exports.generatetoken = generatetoken;
const generateRefreshToken = (payload, options) => {
    return jsonwebtoken_1.default.sign(payload, refreshSecret, Object.assign(Object.assign({}, (options || {})), { expiresIn: '7d' }));
};
exports.generateRefreshToken = generateRefreshToken;
