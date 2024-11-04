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
exports.Emailservice = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class Emailservice {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    sendOrderConfirmation(email, orderDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("it may have reached here for sending mail for cron");
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Gas Booking Confirmation',
                html: `
            <h1>Order Confirmation</h1>
            <p>Dear ${orderDetails.name},</p>
            <p>Your gas booking has been confirmed!</p>
            <p>Order Details:</p>
            <ul>
              <li>Order ID: ${orderDetails.orderId}</li>
              <li>Company: ${orderDetails.company}</li>
              <li>Expected Delivery: ${orderDetails.expectedAt.toLocaleDateString()}</li>
              <li>Amount: ₹${orderDetails.price}</li>
            </ul>
            <p>Thank you for choosing our service!</p>
          `
            };
            try {
                yield this.transporter.sendMail(mailOptions);
                console.log('Order confirmation email sent successfully');
            }
            catch (error) {
                console.error('Error sending order confirmation email:', error);
                throw error;
            }
        });
    }
    sendDeliveryReminder(email, orderDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Gas Delivery Reminder',
                html: `
            <h1>Delivery Reminder</h1>
            <p>Dear ${orderDetails.name},</p>
            <p>Your gas cylinder delivery is scheduled for tomorrow!</p>
            <p>Order ID: ${orderDetails.orderId}</p>
            <p>Expected Delivery: ${orderDetails.expectedAt.toLocaleDateString()}</p>
            <p>Please ensure someone is available to receive the delivery.</p>
          `
            };
            try {
                yield this.transporter.sendMail(mailOptions);
                console.log('Delivery reminder email sent successfully');
            }
            catch (error) {
                console.error('Error sending delivery reminder email:', error);
                throw error;
            }
        });
    }
}
exports.Emailservice = Emailservice;
