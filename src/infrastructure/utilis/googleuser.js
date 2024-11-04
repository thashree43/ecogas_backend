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
exports.getUserFromGoogle = void 0;
const axios_1 = __importDefault(require("axios"));
const getUserFromGoogle = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { data } = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return {
            email: data.email,
            name: data.name,
            id: data.id,
        };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("Error response:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            console.error("Error status:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.status);
        }
        else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
});
exports.getUserFromGoogle = getUserFromGoogle;
