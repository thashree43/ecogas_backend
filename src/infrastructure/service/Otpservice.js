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
exports.Otpservice = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const utilis_1 = require("../utilis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class Otpservice {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    generateotp(length = 4) {
        return (0, utilis_1.generateotp)(length);
    }
    // generatetoken({email}): string {
    //     return generatetoken({email});
    // }
    sendMail(email, subject, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject,
                text: message
            };
            yield this.transporter.sendMail(mailOptions);
        });
    }
}
exports.Otpservice = Otpservice;
