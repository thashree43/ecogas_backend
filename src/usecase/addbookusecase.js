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
exports.addbookusecase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../infrastructure/database");
const domain_1 = require("../domain");
class addbookusecase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    isValidObjectId(id) {
        return mongoose_1.default.Types.ObjectId.isValid(id);
    }
    execute(userId, name, consumerId, mobile, address, company, gender) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidObjectId(userId)) {
                throw new Error("Invalid userId");
            }
            const existingBook = yield database_1.bookModel.findOne({ mobile: mobile });
            if (existingBook) {
                const error = new Error("The book already exists");
                error.statusCode = 409;
                throw error;
            }
            const bookData = new domain_1.BookData({
                name,
                consumerid: consumerId,
                mobile,
                address,
                company,
                gender,
            });
            const bookdatas = yield this.userRepository.savebook(bookData);
            yield this.userRepository.linkbooktouser(userId, bookdatas._id);
            return bookdatas;
        });
    }
}
exports.addbookusecase = addbookusecase;
