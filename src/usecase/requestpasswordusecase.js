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
exports.RequestpasswordUsecase = void 0;
const authtoken_1 = require("../interface/middleware/authtoken");
require('dotenv').config();
class RequestpasswordUsecase {
    constructor(userRepository, redisRepository, otpService) {
        this.userRepository = userRepository;
        this.redisRepository = redisRepository;
        this.otpService = otpService;
    }
    execute(email) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Email received in the use case:", email);
            if (!email) {
                throw new Error("The email is not correct");
            }
            const user = yield this.userRepository.findbyEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            console.log("Processing password reset for user...");
            const token = (0, authtoken_1.generatetoken)({ id: user._id.toString(), email });
            console.log("Generated reset token:", token);
            const th = yield this.redisRepository.store(token, email, 3600);
            const resetlink = `${process.env.CLIENT_URL}/updatepassword/${token}`;
            yield this.otpService.sendMail(email, "Password Reset", `Reset your password using this link: ${resetlink}`);
            return { success: true };
        });
    }
}
exports.RequestpasswordUsecase = RequestpasswordUsecase;
