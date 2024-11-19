import { Emailservice } from "../service/emailservice";
import { userModel, orderModel } from "../database";
import cron from "node-cron";
import logger from "../utilis/logger";

export class OrderNotificationCron {
  private emailService: Emailservice;

  constructor() {
    this.emailService = new Emailservice();
    this.initializeCronJobs();
  }

  private initializeCronJobs() {
    logger.info("Initializing notification cron jobs");

    // Check for new orders every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      logger.info("Running new orders notification check");
      await this.processNewOrders();
    });

    // Send delivery reminders at 10 AM daily  
    cron.schedule('0 10 * * *', async () => {
      logger.info("Running delivery reminders check");
      await this.sendDeliveryReminders();
    });
  }

  private async processNewOrders() {
    try {
      const newOrders = await orderModel.find({
        emailNotificationSent: false,
        status: 'placed'
      }).lean();

      logger.info(`Found ${newOrders.length} new orders to process`);

      for (const order of newOrders) {
        try {
          const user = await userModel.findOne({
            orders: order._id
          });

          if (user?.email) {
            await this.emailService.sendOrderConfirmation(user.email, {
              orderId: order._id.toString(),
              name: order.name,
              company: order.company,
              expectedAt: order.expectedat,
              price: order.price
            });

            await orderModel.findByIdAndUpdate(order._id, {
              emailNotificationSent: true
            });

            logger.info(`Sent confirmation email for order ${order._id}`);
          } else {
            logger.warn(`No user email found for order ${order._id}`);
          }
        } catch (error) {
          logger.error(`Error processing order ${order._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in processNewOrders:', error);
    }
  }

  private async sendDeliveryReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcomingDeliveries = await orderModel.find({
        expectedat: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        reminderSent: false,
        status: 'placed'
      }).lean();

      logger.info(`Found ${upcomingDeliveries.length} deliveries for tomorrow`);

      for (const order of upcomingDeliveries) {
        try {
          const user = await userModel.findOne({
            orders: order._id
          });

          if (user?.email) {
            await this.emailService.sendDeliveryReminder(user.email, {
              orderId: order._id.toString(),
              name: order.name,
              expectedAt: order.expectedat
            });

            await orderModel.findByIdAndUpdate(order._id, {
              reminderSent: true
            });

            logger.info(`Sent delivery reminder for order ${order._id}`);
          } else {
            logger.warn(`No user email found for delivery reminder ${order._id}`);
          }
        } catch (error) {
          logger.error(`Error processing reminder for order ${order._id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in sendDeliveryReminders:', error);
    }
  }
}   