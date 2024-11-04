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
exports.OrderNotificationCron = void 0;
const emailservice_1 = require("../service/emailservice");
const database_1 = require("../database");
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("../utilis/logger"));
class OrderNotificationCron {
    constructor() {
        this.emailService = new emailservice_1.Emailservice();
        this.initializeCronJobs();
    }
    initializeCronJobs() {
        logger_1.default.info("Initializing notification cron jobs");
        // Check for new orders every 15 minutes
        node_cron_1.default.schedule('*/15 * * * *', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Running new orders notification check");
            yield this.processNewOrders();
        }));
        // Send delivery reminders at 10 AM daily  
        node_cron_1.default.schedule('0 10 * * *', () => __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("Running delivery reminders check");
            yield this.sendDeliveryReminders();
        }));
    }
    processNewOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newOrders = yield database_1.orderModel.find({
                    emailNotificationSent: false,
                    status: 'placed'
                }).lean();
                logger_1.default.info(`Found ${newOrders.length} new orders to process`);
                for (const order of newOrders) {
                    try {
                        const user = yield database_1.userModel.findOne({
                            orders: order._id
                        });
                        if (user === null || user === void 0 ? void 0 : user.email) {
                            yield this.emailService.sendOrderConfirmation(user.email, {
                                orderId: order._id.toString(),
                                name: order.name,
                                company: order.company,
                                expectedAt: order.expectedat,
                                price: order.price
                            });
                            yield database_1.orderModel.findByIdAndUpdate(order._id, {
                                emailNotificationSent: true
                            });
                            logger_1.default.info(`Sent confirmation email for order ${order._id}`);
                        }
                        else {
                            logger_1.default.warn(`No user email found for order ${order._id}`);
                        }
                    }
                    catch (error) {
                        logger_1.default.error(`Error processing order ${order._id}:`, error);
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error in processNewOrders:', error);
            }
        });
    }
    sendDeliveryReminders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const upcomingDeliveries = yield database_1.orderModel.find({
                    expectedat: {
                        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
                        $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
                    },
                    reminderSent: false,
                    status: 'placed'
                }).lean();
                logger_1.default.info(`Found ${upcomingDeliveries.length} deliveries for tomorrow`);
                for (const order of upcomingDeliveries) {
                    try {
                        const user = yield database_1.userModel.findOne({
                            orders: order._id
                        });
                        if (user === null || user === void 0 ? void 0 : user.email) {
                            yield this.emailService.sendDeliveryReminder(user.email, {
                                orderId: order._id.toString(),
                                name: order.name,
                                expectedAt: order.expectedat
                            });
                            yield database_1.orderModel.findByIdAndUpdate(order._id, {
                                reminderSent: true
                            });
                            logger_1.default.info(`Sent delivery reminder for order ${order._id}`);
                        }
                        else {
                            logger_1.default.warn(`No user email found for delivery reminder ${order._id}`);
                        }
                    }
                    catch (error) {
                        logger_1.default.error(`Error processing reminder for order ${order._id}:`, error);
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error in sendDeliveryReminders:', error);
            }
        });
    }
}
exports.OrderNotificationCron = OrderNotificationCron;
