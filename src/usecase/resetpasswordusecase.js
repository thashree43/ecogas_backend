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
exports.Resetpasswordusecase = void 0;
const utilis_1 = require("../infrastructure/utilis");
class Resetpasswordusecase {
    constructor(userRepository, redisRepository) {
        this.userRepository = userRepository;
        this.redisRepository = redisRepository;
    }
    execute(token, newpassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token || !newpassword) {
                throw new Error("Invalid input: Token and new password are required");
            }
            try {
                console.log(`Attempting to reset password with token: ${token}`);
                const email = yield this.redisRepository.get(token);
                if (!email) {
                    console.error(`Invalid or expired token: ${token}`);
                    throw new Error("Invalid token");
                }
                console.log(`Retrieved email from token: ${email}`);
                // Hash the new password
                const hashedPassword = yield (0, utilis_1.hashPassword)(newpassword);
                console.log(`Hashed new password for email: ${email}`);
                // Update the user password in the database
                yield this.userRepository.updatePassword(email, hashedPassword);
                console.log(`Updated password in user repository for email: ${email}`);
                // Delete the token from Redis
                yield this.redisRepository.delete(token);
                console.log(`Deleted token from Redis: ${token}`);
                return { success: true };
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.Resetpasswordusecase = Resetpasswordusecase;
