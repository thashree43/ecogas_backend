"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userschema = new mongoose_1.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: false, default: null },
    password: { type: String, required: true },
    is_blocked: { type: Boolean, default: false },
    is_admin: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    book: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Bookdata" }],
    orders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Orders" }],
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("User", userschema);
