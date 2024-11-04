"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateotp = void 0;
require("dotenv").config();
// Function to generate an OTP
const generateotp = (length = 4) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateotp = generateotp;
