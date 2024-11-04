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
exports.loginusecase = void 0;
const authtoken_1 = require("../interface/middleware/authtoken");
const utilis_1 = require("../infrastructure/utilis"); // Adjust import based on your file structure
class loginusecase {
    constructor(loginRepository) {
        this.loginRepository = loginRepository;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                return { success: false, message: "Email and password are required." };
            }
            const user = yield this.loginRepository.findbyEmail(email);
            if (!user) {
                return { success: false, message: "User does not exist." };
            }
            if (user.is_blocked === true) {
                return { success: false, message: "User is blocked." };
            }
            const isPasswordValid = yield (0, utilis_1.verifypassword)(password, user.password);
            if (!isPasswordValid) {
                return { success: false, message: "Invalid password." };
            }
            const tokenPayload = { id: user._id.toString(), email: user.email };
            const accessToken = (0, authtoken_1.generatetoken)(tokenPayload);
            const refreshToken = (0, authtoken_1.generateRefreshToken)(tokenPayload);
            return {
                success: true,
                user: Object.assign(Object.assign({}, user.toObject()), { token: accessToken, refreshToken }), // Include both tokens
                token: accessToken
            };
        });
    }
}
exports.loginusecase = loginusecase;
