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
exports.AgentRepository = void 0;
const database_1 = require("../../infrastructure/database");
class AgentRepository {
    saveagent(agentdata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newagent = new database_1.agentModel({
                    agentname: agentdata.agentname,
                    email: agentdata.email,
                    mobile: agentdata.mobile,
                    password: agentdata.password,
                    pincode: agentdata.pincode,
                    image: agentdata.image,
                    is_Approved: agentdata.is_Approved,
                });
                const savedAgent = yield newagent.save();
                return savedAgent.toObject();
            }
            catch (error) {
                console.error("Error saving agent:", error);
                throw error;
            }
        });
    }
    findemail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agent = (yield database_1.agentModel.findOne({ email }));
                return agent;
            }
            catch (error) {
                console.error("Error finding agent by email:", error);
                throw error;
            }
        });
    }
    findByPincode(pincode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agentdata = (yield database_1.agentModel
                    .find({ pincode: pincode })
                    .populate("products"));
                return agentdata;
            }
            catch (error) {
                console.error("Error finding agents by pincode:", error);
                throw error;
            }
        });
    }
    addproduct(productData, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agent = yield database_1.agentModel
                    .findById(agentId)
                    .populate("products");
                if (!agent) {
                    throw new Error("Agent not found");
                }
                const normalizedCompanyName = productData.companyname.toLowerCase();
                // Check if the product already exists
                const existingProduct = agent.products.find((product) => product.companyname.toLowerCase() === normalizedCompanyName);
                if (existingProduct) {
                    console.log("Product with the same company name already exists. Returning existing product.");
                    return existingProduct;
                }
                // Create and save the new product if it does not exist
                const newProduct = new database_1.productModel(productData);
                const savedProduct = yield newProduct.save();
                yield this.linkProductToAgent(agentId, savedProduct._id);
                return savedProduct;
            }
            catch (error) {
                console.error("Error adding product:", error);
                throw error;
            }
        });
    }
    linkProductToAgent(agentId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.agentModel.findByIdAndUpdate(agentId, {
                    $push: { products: productId },
                });
            }
            catch (error) {
                console.error("Error linking product to agent:", error);
                throw error;
            }
        });
    }
    getallproduct(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agent = yield database_1.agentModel
                    .findById(agentId)
                    .populate("products");
                if (!agent) {
                    console.error(`No agent found with ID: ${agentId}`);
                    return []; // Return an empty array if agent not found
                }
                if (agent.products && agent.products.length > 0) {
                    return agent.products;
                }
                else {
                    console.log(`No products found for agent: ${agent.agentname}`);
                    return []; // Return empty array if no products found
                }
            }
            catch (error) {
                console.error("Error getting all products for agent:", error);
                throw new Error("Error getting all products for agent");
            }
        });
    }
    findbyid(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.productModel.findById(_id).exec();
            }
            catch (error) {
                console.error("Error finding product by ID:", error);
                throw error;
            }
        });
    }
    updateProduct(_id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("The repository reached to updateProduct");
                const data = yield database_1.productModel
                    .findByIdAndUpdate(_id, updateData, { new: true })
                    .exec();
                return data;
            }
            catch (error) {
                console.error("Error updating product:", error);
                throw error;
            }
        });
    }
    deleteproduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield database_1.productModel.findById(id);
                if (!product) {
                    throw new Error("Product not found");
                }
                yield database_1.agentModel.updateMany({ products: id }, { $pull: { products: id } });
                const deletedProduct = yield database_1.productModel.findByIdAndDelete(id);
                console.log("The product has been deleted from the database and agents' data");
                return deletedProduct;
            }
            catch (error) {
                console.error("Error while deleting product:", error);
                throw new Error("Failed to delete product and unlink from agents");
            }
        });
    }
    getordersin(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datas = yield database_1.agentModel.findById(agentId).populate("orders");
                return datas;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    updatestatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.orderModel.findByIdAndUpdate(id, { status: "delivered" }, { new: true });
                return result;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    agentgetsales(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datas = yield database_1.agentModel
                    .findOne({ _id: agentId })
                    .populate({
                    path: "orders",
                    model: "Orders"
                })
                    .exec();
                return datas;
            }
            catch (error) {
                console.error("Error in agentgetsales:", error);
                return null;
            }
        });
    }
    agentdashboard(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datas = yield database_1.agentModel.findOne({ _id: agentId })
                    .populate({
                    path: "orders",
                    model: "Orders",
                    match: { status: "delivered" },
                    select: "price createdAt status expectedat reviewed"
                })
                    .exec();
                if (!datas) {
                    return null;
                }
                // Transform orders to match IOrder interface
                const transformedOrders = datas.orders.map((order) => ({
                    _id: order._id.toString(),
                    createdAt: order.createdAt.toISOString(),
                    expectedat: order.expectedat,
                    status: order.status,
                    price: order.price
                }));
                // Calculate total sales and profit
                const totalSales = transformedOrders.reduce((sum, order) => sum + order.price, 0);
                const totalProfit = totalSales * 0.08; // 8% profit margin
                // Calculate monthly data
                const monthlyData = Array.from({ length: 12 }, (_, i) => {
                    const month = new Date(new Date().getFullYear(), i);
                    const monthOrders = transformedOrders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate.getMonth() === month.getMonth();
                    });
                    const monthlySales = monthOrders.reduce((sum, order) => sum + order.price, 0);
                    const monthlyProfit = monthlySales * 0.08;
                    return {
                        month: month.toLocaleString('default', { month: 'short' }),
                        sales: monthlySales,
                        profit: monthlyProfit
                    };
                });
                const dashboardData = {
                    _id: datas._id.toString(), // Convert ObjectId to string
                    agentname: datas.agentname,
                    orders: transformedOrders,
                    totalSales,
                    totalProfit,
                    monthlyData
                };
                return dashboardData;
            }
            catch (error) {
                console.error("Error in AgentRepository:", error);
                throw error;
            }
        });
    }
}
exports.AgentRepository = AgentRepository;
