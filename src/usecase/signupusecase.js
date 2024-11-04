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
exports.signupusecase = void 0;
const domain_1 = require("../domain");
const utilis_1 = require("../infrastructure/utilis");
class signupusecase {
    constructor(userRepository, otpService, redisRepository) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.redisRepository = redisRepository;
    }
    execute(username, email, mobile, password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("it may have reached to signupusecase");
            if (!username || !email || !mobile || !password) {
                return { message: "Invalid input" };
            }
            const existEmail = yield this.userRepository.findbyEmail(email);
            if (existEmail) {
                return { message: "The email already exists" };
            }
            const hashedPassword = yield (0, utilis_1.hashPassword)(password);
            const user = new domain_1.User({
                username,
                email,
                mobile,
                password: hashedPassword,
            });
            console.log("the user data has reached here");
            const otp = this.otpService.generateotp(4);
            console.log("the otp be this ", otp);
            const subject = `YOUR OTP CODE ${otp}`;
            const message = `The OTP for your registration is ${otp}`;
            yield this.otpService.sendMail(email, subject, message);
            yield this.redisRepository.store(email, otp, 300);
            // Convert User instance to IUserData
            const userData = user.toIUserData();
            const savedUserData = yield this.userRepository.saveuser(userData);
            // Convert savedUserData to User instance
            const savedUser = new domain_1.User(savedUserData);
            return savedUser;
        });
    }
}
exports.signupusecase = signupusecase;
