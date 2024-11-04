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
exports.GoogleAuthUseCase = void 0;
const domain_1 = require("../domain");
const utilis_1 = require("../infrastructure/utilis");
const authtoken_1 = require("../interface/middleware/authtoken");
class GoogleAuthUseCase {
    constructor(googlrepository) {
        this.googlrepository = googlrepository;
    }
    execute(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                throw new Error("The token is required.");
            }
            try {
                console.log("Starting Google authentication with token:", token);
                const { name, email, id } = yield (0, utilis_1.getUserFromGoogle)(token);
                console.log("Retrieved user info from Google:", { name, email, id });
                let userData = yield this.googlrepository.findbyEmail(email);
                let user;
                if (!userData) {
                    console.log("User not found in the repository. Creating new user...");
                    user = new domain_1.User({
                        username: name,
                        email: email,
                        mobile: null,
                        password: id,
                        is_blocked: false,
                        is_admin: false,
                        is_verified: true
                    });
                    userData = yield this.googlrepository.saveuser(user);
                    console.log("New user saved in the repository:", userData);
                }
                else {
                    console.log("User found in the repository:", userData);
                    user = new domain_1.User(userData);
                }
                if (user.is_blocked) {
                    console.error("User is blocked.");
                    throw new Error("User is blocked.");
                }
                const tokenPayload = { id: user._id.toString(), email };
                const newToken = (0, authtoken_1.generatetoken)(tokenPayload);
                const refreshToken = (0, authtoken_1.generateRefreshToken)(tokenPayload);
                console.log("Generated tokens:", { newToken, refreshToken, user });
                return { success: true, token: newToken, refreshToken, user };
            }
            catch (error) {
                console.error("Error in Google authentication use case:", error);
                throw error;
            }
        });
    }
}
exports.GoogleAuthUseCase = GoogleAuthUseCase;
