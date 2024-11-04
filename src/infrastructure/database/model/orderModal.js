"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderModel = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: Number, required: true },
    consumerid: { type: Number, required: true },
    company: { type: String, required: true },
    price: { type: Number, required: true },
    paymentmethod: { type: String, required: true },
    expectedat: { type: Date, required: true },
    status: { type: String, required: true },
    emailNotificationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false }
}, { timestamps: true });
exports.orderModel = (0, mongoose_1.model)("Orders", orderSchema);
