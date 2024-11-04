"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentProduct = void 0;
class AgentProduct {
    constructor({ _id, companyname, weight, price, quantity, }) {
        this._id = _id;
        this.companyname = companyname;
        this.weight = weight;
        this.price = price;
        this.quantity = quantity;
    }
}
exports.AgentProduct = AgentProduct;
