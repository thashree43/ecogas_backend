import nodemailer from "nodemailer";
import { generateotp } from "../utilis";
import { config } from "dotenv";

config(); 

export class Otpservice {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    generateotp(length: number = 4): string {
        return generateotp(length);
    }

    // generatetoken({email}): string {
    //     return generatetoken({email});
    // }

    async sendMail(
        email: string,
        subject: string,
        message: string
    ): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message
        };
        await this.transporter.sendMail(mailOptions);
    }
}
