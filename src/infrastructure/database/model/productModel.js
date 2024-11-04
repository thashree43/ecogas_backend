"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productModel = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    companyname: { type: String, required: true },
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});
exports.productModel = (0, mongoose_1.model)("Product", productSchema);
