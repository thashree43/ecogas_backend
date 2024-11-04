"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = require("mongoose");
class Agent {
    constructor(data) {
        this._id = data._id || new mongoose_1.Types.ObjectId();
        this.agentname = data.agentname || "";
        this.email = data.email || "";
        this.mobile = data.mobile || 0;
        this.password = data.password || "";
        this.pincode = data.pincode || 0;
        this.is_Approved = data.is_Approved || false;
        this.image = data.image || "";
        this.products = data.products || [];
        this.orders = data.orders || [];
    }
}
exports.Agent = Agent;
