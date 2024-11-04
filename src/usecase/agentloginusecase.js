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
exports.agentloginusecase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const authtoken_1 = require("../interface/middleware/authtoken");
class agentloginusecase {
    constructor(agentRepository) {
        this.agentRepository = agentRepository;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agent = yield this.agentRepository.findemail(email);
                if (!agent) {
                    return { success: false, message: "Agent not found" };
                }
                const isPasswordValid = yield bcrypt_1.default.compare(password, agent.password);
                if (!isPasswordValid) {
                    console.log("Invalid password");
                    return { success: false, message: "Invalid credentials" };
                }
                if (!agent.is_Approved) {
                    return { success: false, message: "Agent is not approved" };
                }
                const token = (0, authtoken_1.generatetoken)({ id: agent._id.toString(), email: agent.email });
                const agentrefreshToken = (0, authtoken_1.generateRefreshToken)({ id: agent._id.toString(), email: agent.email });
                return { success: true, agent, token, agentrefreshToken };
            }
            catch (error) {
                console.error("Error during login:", error);
                return { success: false, message: "An error occurred during login" };
            }
        });
    }
}
exports.agentloginusecase = agentloginusecase;
