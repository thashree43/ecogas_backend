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
exports.admindashboardusecase = void 0;
class admindashboardusecase {
    constructor(AdminRepository) {
        this.AdminRepository = AdminRepository;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalOrdersCount = yield this.AdminRepository.getTotalOrdersCount();
                const { totalOrdersAmount, totalProfit } = yield this.AdminRepository.getTotalOrdersAndProfit();
                const totalAgentCount = yield this.AdminRepository.getTotalAgentCount();
                const monthlySales = yield this.AdminRepository.getMonthlySales();
                return {
                    totalOrdersCount,
                    totalOrdersAmount,
                    totalProfit,
                    totalAgentCount,
                    monthlySales,
                };
            }
            catch (error) {
                console.error("Failed to retrieve dashboard data:", error);
                throw new Error("Failed to retrieve dashboard data");
            }
        });
    }
}
exports.admindashboardusecase = admindashboardusecase;
