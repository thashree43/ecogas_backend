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
exports.sendmessageusecase = void 0;
const database_1 = require("../infrastructure/database");
class sendmessageusecase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(content, chatId, userId, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const receiverData = yield database_1.userModel.findOne({ is_admin: true });
            if (!receiverData) {
                throw new Error("Admin user not found");
            }
            const newMessageData = {
                reciever: receiverData._id,
                sender: userId,
                content: content,
                chat: chatId,
                image: image || null
            };
            const savedMessage = yield this.userRepository.saveMessage(newMessageData);
            yield this.userRepository.updateLatestMessage(chatId, savedMessage._id);
            return savedMessage;
        });
    }
}
exports.sendmessageusecase = sendmessageusecase;
