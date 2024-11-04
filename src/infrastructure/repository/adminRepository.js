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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const database_1 = require("../database");
const chatModel_1 = require("../database/model/chatModel");
const messageModel_1 = __importDefault(require("../database/model/messageModel"));
class AdminRepository {
    constructor() { }
    findbyEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield database_1.userModel.findOne({ email }));
        });
    }
    getall() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.userModel.find().lean();
                console.log("hello here reached");
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    updatestatus(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateduser = yield database_1.userModel.findOneAndUpdate({ _id: id }, data, {
                    new: true,
                });
                if (!updateduser) {
                    throw new Error("the user may not found ");
                }
                return updateduser;
            }
            catch (error) {
                throw new Error("error in db while updating status in blocking the user");
            }
        });
    }
    getallagent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.agentModel.find(); // Fetching all agents from the database
            }
            catch (error) {
                console.error(error);
                throw new Error("Error fetching agents");
            }
        });
    }
    updateApproval(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateagentapproval = yield database_1.agentModel.findOneAndUpdate({ _id: id }, data, {
                    new: true
                });
                if (!updateagentapproval) {
                    throw new Error("agent not found");
                }
                return updateagentapproval;
            }
            catch (error) {
                throw new Error("there is some mistake may seems in while in the db model");
            }
        });
    }
    allorders() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield database_1.orderModel.find();
                return data;
            }
            catch (error) {
                console.error(error, "error occurred while getting orders");
                throw new Error("Error fetching orders");
            }
        });
    }
    getcustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datas = yield chatModel_1.ChatModel
                    .find()
                    .populate("user", "username email")
                    .populate("latestmessage", "content createdAt")
                    .sort({ updatedAt: -1 });
                return datas;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error fetching customers");
            }
        });
    }
    getMessages(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield messageModel_1.default.find({ chat: chatId })
                    .sort({ createdAt: 1 })
                    .populate('sender', 'username');
                return messages;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error fetching messages");
            }
        });
    }
    saveMessage(messagedata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure the data is in the correct format before saving
                const formattedData = {
                    reciever: Array.isArray(messagedata.reciever) ? messagedata.reciever : [messagedata.reciever],
                    sender: Array.isArray(messagedata.sender) ? messagedata.sender : [messagedata.sender],
                    content: messagedata.content,
                    chat: Array.isArray(messagedata.chat) ? messagedata.chat : [messagedata.chat],
                    image: messagedata.image
                };
                const newMessage = new messageModel_1.default(formattedData);
                return yield newMessage.save();
            }
            catch (error) {
                console.error('Error saving message:', error);
                throw error;
            }
        });
    }
    sendMessage(chatId, adminId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newMessage = yield messageModel_1.default.create({
                    reciever: [],
                    sender: [adminId],
                    content: content,
                    chat: [chatId],
                });
                yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, { latestmessage: newMessage._id });
                return newMessage;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error sending message");
            }
        });
    }
    updateLatestMessage(chatId, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, { $push: { latestmessage: messageId } }, { new: true });
        });
    }
    getsales() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datas = yield database_1.agentModel.find().populate("orders");
                return datas;
            }
            catch (error) {
                console.error(error, "the error while sales listing");
                throw new Error("errors ooccured in ");
            }
        });
    }
    getTotalOrdersCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.orderModel.countDocuments({ status: "delivered" });
        });
    }
    getTotalOrdersAndProfit() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deliveredOrders = yield database_1.orderModel.find({ status: "delivered" });
                const { totalOrdersAmount, totalProfit } = deliveredOrders.reduce((totals, order) => {
                    totals.totalOrdersAmount += order.price;
                    totals.totalProfit += order.price * 0.04;
                    return totals;
                }, { totalOrdersAmount: 0, totalProfit: 0 });
                return { totalOrdersAmount, totalProfit };
            }
            catch (error) {
                console.error("Error calculating total orders and profit:", error);
                throw new Error("Error calculating totals.");
            }
        });
    }
    getTotalAgentCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.agentModel.countDocuments({});
        });
    }
    getMonthlySales() {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.orderModel.aggregate([
                { $match: { status: "delivered" } },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        totalOrders: { $sum: 1 },
                        totalProfit: { $sum: { $multiply: ["$price", 0.04] } },
                        totalOrdersAmount: { $sum: "$price" }
                    }
                },
                {
                    $project: {
                        month: { $toString: "$_id.month" },
                        totalOrders: 1,
                        totalProfit: 1,
                        totalOrdersAmount: 1
                    }
                },
                { $sort: { month: 1 } }
            ]);
        });
    }
}
exports.AdminRepository = AdminRepository;
