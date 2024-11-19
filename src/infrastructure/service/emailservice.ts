import nodemailer from "nodemailer"
import {config} from "dotenv"
config();

export class Emailservice{
    private transporter:nodemailer.Transporter
    constructor(){
        this.transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })
    }

    async sendOrderConfirmation(
        email: string,
        orderDetails: {
          orderId: string;
          name: string;
          company: string;
          expectedAt: Date;
          price: number;
        }
      ) {
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
          await this.transporter.sendMail(mailOptions);
          console.log('Order confirmation email sent successfully');
        } catch (error) {
          console.error('Error sending order confirmation email:', error);
          throw error;
        }
      }
      async sendDeliveryReminder(
        email: string,
        orderDetails: {
          orderId: string;
          name: string;
          expectedAt: Date;
        }
      ) {
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
          await this.transporter.sendMail(mailOptions);
          console.log('Delivery reminder email sent successfully');
        } catch (error) {
          console.error('Error sending delivery reminder email:', error);
          throw error;
        }
      }
    
    
}