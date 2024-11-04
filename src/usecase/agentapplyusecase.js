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
exports.Agentapplyusecase = void 0;
const domain_1 = require("../domain");
const utilis_1 = require("../infrastructure/utilis");
class Agentapplyusecase {
    constructor(agentRepository) {
        this.agentRepository = agentRepository;
    }
    applyAgent(agentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield (0, utilis_1.hashPassword)(agentData.password);
            const newAgent = new domain_1.Agent({
                agentname: agentData.agentname,
                email: agentData.email,
                mobile: parseInt(agentData.mobile),
                password: hashedPassword,
                pincode: parseInt(agentData.pincode),
                image: agentData.image,
            });
            const savedAgent = yield this.agentRepository.saveagent(newAgent);
            return new domain_1.Agent(savedAgent);
        });
    }
}
exports.Agentapplyusecase = Agentapplyusecase;
