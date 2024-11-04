"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderplaceusecase = void 0;
const emailservice_1 = require("../infrastructure/service/emailservice");
class orderplaceusecase {
    constructor(UserRepositories) {
        this.UserRepositories = UserRepositories;
        this.emailService = new emailservice_1.Emailservice();
    }
    execute(userId, selectedProviderId, customerDetails, paymentMethod, selectedGas) {
        return __awaiter(this, void 0, void 0, function* () {
            let statuschange;
            if (paymentMethod === "UPI") {
                statuschange = "placed";
            }
            else {
                statuschange = "placed";
            }
            const orderData = {
                name: customerDetails.name,
                address: customerDetails.address,
                mobile: parseInt(customerDetails.mobile),
                consumerid: parseInt(customerDetails.consumerId),
                company: selectedGas.companyname,
                price: selectedGas.price,
                paymentmethod: paymentMethod,
                expectedat: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                status: statuschange,
                emailNotificationSent: false,
                reminderSent: false
            };
            const selectedgasId = selectedGas._id;
            const order = yield this.UserRepositories.createOrder(selectedgasId, orderData);
            const orderId = order._id;
            yield this.UserRepositories.linkOrderToUser(userId, orderId);
            yield this.UserRepositories.linkOrderToProvider(selectedProviderId, orderId);
            const user = yield this.UserRepositories.getbyId(userId);
            if (user && user.email) {
                // Send immediate confirmation
                yield this.emailService.sendOrderConfirmation(user.email, {
                    orderId: orderId.toString(),
                    name: customerDetails.name,
                    company: selectedGas.companyname,
                    expectedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    price: selectedGas.price
                });
                yield this.UserRepositories.updateOrder(orderId, {
                    emailNotificationSent: true
                });
            }
            // Return a success object
            return { success: true, order };
        });
    }
}
exports.orderplaceusecase = orderplaceusecase;
