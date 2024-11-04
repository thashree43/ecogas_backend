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
exports.VerifyOtpUseCase = void 0;
const authtoken_1 = require("../interface/middleware/authtoken");
class VerifyOtpUseCase {
    constructor(verifyOtpRepository, userRepository) {
        this.verifyOtpRepository = verifyOtpRepository;
        this.userRepository = userRepository;
    }
    execute(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!otp || !email) {
                throw new Error("OTP and email are required.");
            }
            console.log(`Verifying OTP for email: ${email}`);
            const userOtp = yield this.verifyOtpRepository.get(email);
            console.log(`User OTP from Redis: ${userOtp}`);
            if (userOtp === null) {
                console.error(`OTP not found in Redis for email: ${email}`);
                throw new Error("OTP not found in Redis.");
            }
            if (userOtp !== otp) {
                throw new Error("Invalid OTP.");
            }
            yield this.verifyOtpRepository.delete(email);
            const user = yield this.userRepository.findbyEmail(email);
            if (!user) {
                throw new Error("User not found.");
            }
            user.is_verified = true;
            yield user.save();
            const tokenPayload = { id: user._id.toString(), email };
            const token = (0, authtoken_1.generatetoken)(tokenPayload);
            const refreshToken = (0, authtoken_1.generatetoken)(tokenPayload);
            return {
                success: true,
                token,
                refreshToken,
                user
            };
        });
    }
}
exports.VerifyOtpUseCase = VerifyOtpUseCase;
