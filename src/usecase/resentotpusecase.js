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
exports.ResentotpUseCase = void 0;
class ResentotpUseCase {
    constructor(otpRepository, redisRepository) {
        this.otpRepository = otpRepository;
        this.redisRepository = redisRepository;
    }
    execute(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email) {
                throw new Error("the email is not correct ");
            }
            const otp = this.otpRepository.generateotp(4);
            const subject = "your Otp Code";
            const message = `your otp code is ${otp}`;
            yield this.otpRepository.sendMail(email, subject, message);
            yield this.redisRepository.store(email, otp, 60);
        });
    }
}
exports.ResentotpUseCase = ResentotpUseCase;
