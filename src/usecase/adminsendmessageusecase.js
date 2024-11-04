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
exports.AdminSendMessageUseCase = void 0;
const database_1 = require("../infrastructure/database");
class AdminSendMessageUseCase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    execute(chatId, adminId, content, image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receiverData = yield database_1.ChatModel.findOne({ _id: chatId });
                if (!receiverData || !receiverData.user[0]) {
                    throw new Error('Chat or user not found');
                }
                // Convert the ID to string and then create the message data
                const receiverId = receiverData.user[0].toString();
                const newMessageData = {
                    reciever: [receiverId], // Note: using "reciever" to match your schema
                    sender: [adminId],
                    content: content,
                    chat: [chatId],
                    image: image
                };
                const savedMessage = yield this.adminRepository.saveMessage(newMessageData);
                yield this.adminRepository.updateLatestMessage(chatId, savedMessage._id);
                return savedMessage;
            }
            catch (error) {
                console.error('Error in AdminSendMessageUseCase:', error);
                throw error;
            }
        });
    }
}
exports.AdminSendMessageUseCase = AdminSendMessageUseCase;
