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
exports.Adminloginusecase = void 0;
const utilis_1 = require("../infrastructure/utilis");
const authtoken_1 = require("../interface/middleware/authtoken");
class Adminloginusecase {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                return { success: false, message: "Email and password are required." };
            }
            const admin = yield this.adminRepository.findbyEmail(email);
            if (!admin) {
                return { success: false, message: "Admin doesn't exist." };
            }
            if (admin.is_admin) {
                const isPassValid = yield (0, utilis_1.verifypassword)(password, admin.password);
                if (!isPassValid) {
                    return { success: false, message: "Password is not correct." };
                }
                const token = (0, authtoken_1.generatetoken)({ id: admin._id.toString(), email: admin.email }, { expiresIn: "1h" });
                const refreshToken = (0, authtoken_1.generateRefreshToken)({ id: admin._id.toString(), email: admin.email }, { expiresIn: "7d" });
                return { success: true, admin, token, refreshToken };
            }
            return { success: false, message: "You are not authorized." };
        });
    }
}
exports.Adminloginusecase = Adminloginusecase;
