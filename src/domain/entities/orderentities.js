"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderData = void 0;
class OrderData {
    constructor({ _id, name, address, mobile, consumerid, company, price, paymentmethod, expectedat, status }) {
        this._id = _id,
            this.name = name,
            this.address = address,
            this.mobile = mobile,
            this.consumerid = consumerid,
            this.company = company,
            this.price = price,
            this.paymentmethod = paymentmethod,
            this.expectedat = expectedat,
            this.status = status;
    }
}
exports.OrderData = OrderData;
