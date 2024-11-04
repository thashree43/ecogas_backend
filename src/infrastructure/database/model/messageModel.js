"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    reciever: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    sender: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, trim: true }, // Remove required: true since we might have image-only messages
    chat: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Chats" }],
    image: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Message", messageSchema);
