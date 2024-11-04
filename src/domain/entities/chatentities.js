"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const mongoose_1 = require("mongoose");
class chat {
    constructor(data) {
        this._id = data._id || new mongoose_1.Types.ObjectId();
        this.chatname = data.chatname || '';
        this.admin = data.admin || [];
        this.user = data.user || [];
        this.latestmessage = data.latestmessage || []; // Changed from latestmessages to latestmessage
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
exports.chat = chat;
