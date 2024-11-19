import crypto from "crypto";
require("dotenv").config()



// Function to generate an OTP
export const generateotp = (length: number = 4): string => {
    const digits: string = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};


