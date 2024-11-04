"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
class Message {
    constructor(data) {
        this._id = data._id || new mongoose_1.Types.ObjectId;
        this.reciever = data.reciever || [];
        this.sender = data.sender || [];
        this.content = data.content;
        this.chat = data.chat || [];
        this.image = data.image;
    }
}
exports.Message = Message;
