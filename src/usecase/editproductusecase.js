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
exports.EditProductUseCase = void 0;
const mongoose_1 = require("mongoose");
class EditProductUseCase {
    constructor(agentRepository) {
        this.agentRepository = agentRepository;
    }
    execute(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, companyname, weight, price, quantity } = productData;
            if (!_id) {
                throw new Error("Product ID is required");
            }
            // Ensure _id is either a string or ObjectId
            let productId;
            if (typeof _id === "string" && mongoose_1.Types.ObjectId.isValid(_id)) {
                productId = new mongoose_1.Types.ObjectId(_id); // Convert to ObjectId if it's a valid string
            }
            else if (_id instanceof mongoose_1.Types.ObjectId) {
                productId = _id; // If already ObjectId, use it directly
            }
            else {
                throw new Error("Invalid Product ID");
            }
            try {
                // Update the product using the repository method
                const data = yield this.agentRepository.updateProduct(productId, {
                    companyname,
                    weight,
                    price,
                    quantity,
                });
                return data;
            }
            catch (error) {
                console.error("Error updating product:", error);
                throw error;
            }
        });
    }
}
exports.EditProductUseCase = EditProductUseCase;
