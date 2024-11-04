"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookModel = void 0;
const mongoose_1 = require("mongoose");
const Bookschema = new mongoose_1.Schema({
    name: { type: String, require: true },
    consumerid: { type: Number, required: true },
    mobile: { type: Number, required: true },
    address: { type: String, required: true },
    company: { type: String, required: true },
    gender: { type: String, required: true },
});
exports.bookModel = (0, mongoose_1.model)("Bookdata", Bookschema);
