"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const secret = "sk_test_51Q2oHQ07bhNnobEeL2Wz4oIOqIk1Bjt4pp75hDnQV1fzCPBivbNYcHzrogTibMqSCG6dG6dcNKyIkraFG3fkpaXE00l57qO0rM";
const stripe = new stripe_1.default(secret, {
    apiVersion: '2024-06-20',
});
exports.default = stripe;
