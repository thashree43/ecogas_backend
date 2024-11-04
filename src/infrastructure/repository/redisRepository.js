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
exports.RedisOtpRepository = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
require("dotenv").config();
class RedisOtpRepository {
    constructor() {
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        });
        this.client.on("connect", () => {
            console.log("Redis has connected");
        });
        this.client.on("error", (err) => {
            console.error("Redis encountered an error", err);
        });
    }
    store(email, otp, ttlseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            ttlseconds = 60;
            try {
                console.log(`Storing OTP: ${otp} for email: ${email},ttlseconds be that :${ttlseconds}`);
                yield this.client.setex(email, ttlseconds, otp);
            }
            catch (error) {
                console.error("Error storing OTP in Redis:", error);
                throw new Error("Error in DB");
            }
        });
    }
    get(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Retrieving OTP for email: ${email}`);
                const result = yield this.client.get(email);
                if (!result) {
                    console.warn(`No OTP found in Redis for email: ${email}`);
                }
                return result;
            }
            catch (error) {
                console.error("Error retrieving OTP from Redis:", error);
                return null;
            }
        });
    }
    delete(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Deleting OTP for email: ${email}`);
                yield this.client.del(email);
            }
            catch (error) {
                console.error("Error deleting OTP from Redis:", error);
            }
        });
    }
}
exports.RedisOtpRepository = RedisOtpRepository;
