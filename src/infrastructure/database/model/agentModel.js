"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentModel = void 0;
const mongoose_1 = require("mongoose");
const agentSchema = new mongoose_1.Schema({
    agentname: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true },
    pincode: { type: Number, required: true },
    is_Approved: { type: Boolean, default: false },
    image: { type: String, required: true },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Orders" }]
}, { timestamps: true });
exports.agentModel = (0, mongoose_1.model)("Agent", agentSchema);
