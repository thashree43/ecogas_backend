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
exports.UserRepository = void 0;
const database_1 = require("../../infrastructure/database");
const database_2 = require("../../infrastructure/database"); // Import userModel if not already
const chatModel_1 = require("../database/model/chatModel");
const messageModel_1 = __importDefault(require("../database/model/messageModel"));
class UserRepository {
    findbyEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield database_2.userModel.findOne({ email }));
        });
    }
    getbyId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_2.userModel.findOne({ _id: id });
                console.log("hello here reached");
            }
            catch (error) {
                throw new Error("error in db");
            }
        });
    }
    saveuser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createUser = new database_2.userModel(userData);
                return (yield createUser.save());
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    findByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield database_2.userModel.findOne({ _id: googleId }));
        });
    }
    updatePassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_2.userModel.findOne({ email });
                if (!user)
                    return false;
                user.password = password;
                yield user.save();
                return true;
            }
            catch (error) {
                throw new Error("the password has not changed");
            }
        });
    }
    savebook(book) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookdata = new database_2.bookModel(book);
                return yield bookdata.save();
            }
            catch (error) {
                throw new Error("the data is invalid to add the book");
            }
        });
    }
    linkbooktouser(userId, bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addeddate = yield database_2.userModel.findByIdAndUpdate({ _id: userId }, { $push: { book: bookId } });
            }
            catch (error) {
                console.error("the error seems here");
                throw new Error("invalid server error");
            }
        });
    }
    getbookbyid(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_2.userModel.findById(userId).populate('book');
                return user;
            }
            catch (error) {
                console.error("Error in getbookbyid:", error);
                return null;
            }
        });
    }
    deletebookbyid(bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Book = yield database_2.bookModel.findById(bookId);
                console.log("bookdata found in the userrepository", Book);
                if (!Book) {
                    throw new Error("the book has not found");
                }
                yield database_2.userModel.updateMany({ book: bookId }, { $pull: { book: bookId } });
                const deletebook = yield database_2.bookModel.findByIdAndDelete(bookId);
                console.log("the book has been deleted");
                return deletebook;
            }
            catch (error) {
                throw new Error("the book has not yet deleted ");
            }
        });
    }
    createOrder(selectedgasId, order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gasdata = yield database_1.productModel.findById(selectedgasId);
                if (gasdata && gasdata.quantity > 0) {
                    const newOrder = new database_1.orderModel(order);
                    const orderdata = yield newOrder.save();
                    yield database_1.productModel.findByIdAndUpdate(selectedgasId, { $inc: { quantity: -1 } });
                    return orderdata;
                }
                else {
                    throw new Error("Insufficient product quantity to create order");
                }
            }
            catch (error) {
                console.error(error);
                throw new Error("Failed to create order");
            }
        });
    }
    linkOrderToUser(userId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield database_2.userModel.findByIdAndUpdate(userId, { $push: { orders: orderId } }, { new: true });
                return updatedUser;
            }
            catch (error) {
                console.error(error);
                throw new Error("Failed to link order to user");
            }
        });
    }
    linkOrderToProvider(selectedProviderId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedAgent = yield database_1.agentModel.findByIdAndUpdate(selectedProviderId, { $push: { orders: orderId } }, { new: true });
                return updatedAgent;
            }
            catch (error) {
                console.error(error);
                throw new Error("Failed to link order to provider");
            }
        });
    }
    listorder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield database_2.userModel.findById(id).populate('orders');
                if (!data) {
                    throw new Error("User not found");
                }
                return data;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error occurred while fetching orders");
            }
        });
    }
    userchating(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield database_2.userModel.findById(userId);
                if (!user) {
                    throw new Error("User not found");
                }
                const admin = yield database_2.userModel.findOne({ is_admin: true });
                if (!admin) {
                    throw new Error("Admin not found");
                }
                let chat = yield chatModel_1.ChatModel.findOne({
                    user: userId,
                    admin: admin._id
                }).populate('latestmessage');
                if (!chat) {
                    chat = yield chatModel_1.ChatModel.create({
                        chatname: `Chat with ${user.username}`,
                        admin: [admin._id],
                        user: [userId],
                        latestmessage: []
                    });
                }
                return {
                    chatId: chat._id.toString(),
                    messages: chat.latestmessage,
                    user: user.toObject()
                };
            }
            catch (error) {
                console.error("Error in userchating:", error);
                throw error;
            }
        });
    }
    saveMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new messageModel_1.default(messageData);
            return yield newMessage.save();
        });
    }
    findmessagebyid(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.default.findById(messageId)
                .populate("sender")
                .populate("chat.user");
        });
    }
    updateLatestMessage(chatId, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield chatModel_1.ChatModel.findByIdAndUpdate(chatId, { latestMessage: messageId }, { new: true });
        });
    }
    getmessages(chatid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield messageModel_1.default.find({ chat: chatid });
                return res;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    updateOrder(orderId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("it may have reacheed to work the cron ");
                const updatedOrder = yield database_1.orderModel.findByIdAndUpdate(orderId, { $set: updateData }, { new: true });
                return updatedOrder;
            }
            catch (error) {
                console.error('Error updating order:', error);
                throw new Error('Failed to update order');
            }
        });
    }
}
exports.UserRepository = UserRepository;
