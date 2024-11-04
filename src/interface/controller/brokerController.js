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
exports.agentController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const authtoken_1 = require("../middleware/authtoken");
class agentController {
    constructor(agentApplyUsecase, agentLoginUseCase, productAddingusecase, ListingProductUseCase, EditProductUseCase, DeleteproductUseCase, GetordersfromAgent, UpdateOrderStatus, Agentsaleslistusecase, AgentDashboarusecase) {
        this.agentApplyUsecase = agentApplyUsecase;
        this.agentLoginUseCase = agentLoginUseCase;
        this.productAddingusecase = productAddingusecase;
        this.ListingProductUseCase = ListingProductUseCase;
        this.EditProductUseCase = EditProductUseCase;
        this.DeleteproductUseCase = DeleteproductUseCase;
        this.GetordersfromAgent = GetordersfromAgent;
        this.UpdateOrderStatus = UpdateOrderStatus;
        this.Agentsaleslistusecase = Agentsaleslistusecase;
        this.AgentDashboarusecase = AgentDashboarusecase;
        this.agentregister = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            console.log("Controller reached. Request body:", req.body);
            console.log("File:", req.file);
            try {
                if (!req.file) {
                    res.status(400).json({ message: "Image file is required" });
                    return;
                }
                const agentData = {
                    agentname: req.body.agentname,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: req.body.password,
                    pincode: req.body.pincode,
                    image: req.file.location,
                };
                const savedAgent = yield this.agentApplyUsecase.applyAgent(agentData);
                res
                    .status(201)
                    .json({ message: "Agent application submitted", agent: savedAgent });
            }
            catch (error) {
                console.error("Error in agent registration:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        this.agentlogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            console.log(`Login attempt for email: ${email}`);
            try {
                const response = yield this.agentLoginUseCase.execute(email, password);
                if (response.success && response.agent) {
                    const token = (0, authtoken_1.generatetoken)({ id: response.agent._id.toString(), email });
                    const refreshToken = (0, authtoken_1.generateRefreshToken)({ id: response.agent._id.toString(), email });
                    res.cookie("agentToken", token, {
                        maxAge: 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res.cookie("agentRefreshToken", refreshToken, {
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res.status(200).json({
                        success: true,
                        agent: response.agent,
                        token,
                    });
                }
                else {
                    res.status(401).json({
                        success: false,
                        message: response.message || "Login failed",
                    });
                }
            }
            catch (error) {
                console.error("Login error:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
        this.agentlogout = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.cookie("agentToken", "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    expires: new Date(0),
                });
                res.cookie("agentRefreshToken", "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    expires: new Date(0),
                });
                res.status(200).json({ message: 'Agent has been logged out' });
            }
            catch (error) {
            }
        });
        this.addProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { companyName, kg, price, quantity } = req.body;
            const token = req.cookies.agentToken;
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                const agentId = decodedToken.id;
                const productData = {
                    companyname: companyName,
                    weight: kg,
                    price: price,
                    quantity: quantity,
                };
                const addedProduct = yield this.productAddingusecase.addProduct(agentId, productData);
                if (!addedProduct) {
                    res.status(409).json({
                        success: false,
                        message: "Product with the same name already exists.",
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    message: "Product added",
                    product: addedProduct,
                });
            }
            catch (error) {
                console.error("Error in adding product:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        this.listproduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.agentToken;
            console.log(" the tokenin the controller ", token);
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                console.log(decodedToken, "ythe decoded toen ");
                const agentId = decodedToken.id;
                console.log(agentId, "the id in the cintrolagent");
                const products = yield this.ListingProductUseCase.execute(agentId);
                res.status(200).json({ success: true, products });
            }
            catch (error) {
                console.error("the error may occured here", error);
                res.status(500).json({ message: "Internal error" });
            }
        });
        this.editproduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { _id, companyname, weight, price, quantity } = req.body;
            console.log("The ID is this for editing product:", _id);
            console.log("The data from the body:", req.body);
            try {
                // Ensure _id is a valid ObjectId
                const productId = new mongoose_1.Types.ObjectId(_id); // Use 'Types.ObjectId' instead of 'Schema.Types.ObjectId'
                // Create the product object
                const productData = {
                    _id: productId,
                    companyname,
                    weight,
                    price,
                    quantity,
                };
                // Update the product
                console.log("The use case reached");
                const updatedProduct = yield this.EditProductUseCase.execute(productData);
                if (!updatedProduct) {
                    res.status(404).json({ message: "Product not found" });
                    return;
                }
                res.status(200).json(updatedProduct);
            }
            catch (error) {
                console.error("The error may have occurred here:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        this.deleteProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.params.id, "while deleting the product");
            try {
                const id = req.params.id;
                yield this.DeleteproductUseCase.execute(id);
                res
                    .status(200)
                    .json({ message: "Product deleted successfully", success: true });
            }
            catch (error) {
                console.error("Error occurred while deleting the product:", error);
                res.status(500).json({ message: "Error deleting the product" });
            }
        });
        this.getordersin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.agentToken;
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                const agentId = decodedToken.id;
                const result = yield this.GetordersfromAgent.execute(agentId);
                console.log(result, "the datas in the control");
                if (result) {
                    res.status(200).json({ success: true, result });
                }
                else {
                    res.status(404).json({ success: false, message: "No orders found" });
                }
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
        this.statusupdate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.orderid;
            console.log(id, "the data make the update in status ");
            try {
                const data = yield this.UpdateOrderStatus.execute(id);
                console.log("updated status");
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({
                    success: false,
                    error: "An error occurred while updating the order status",
                });
            }
        });
        this.getsaleslists = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const agentId = req.params.agentid;
                console.log("ID for listing sales:", agentId);
                const data = yield this.Agentsaleslistusecase.execute(agentId);
                if (!data) {
                    res.status(404).json({ success: false, message: "No sales data found" });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: data
                });
            }
            catch (error) {
                console.error("Error while getting sales:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        });
        this.getdashboard = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.agentToken;
            console.log(" the tokenin the controller ", token);
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                console.log(decodedToken, "ythe decoded toen ");
                const agentId = decodedToken.id;
                console.log("agentid be thus ", agentId);
                const datas = yield this.AgentDashboarusecase.execute(agentId);
                res.json(datas);
            }
            catch (error) {
                console.error(error);
            }
        });
        this.jwtSecret = process.env.JWT_ACCESS_SECRET || "default_jwt_secret";
    }
    agentrefreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.agentRefreshToken;
            if (!refreshToken) {
                return res.status(403).json({ message: 'Refresh token not provided' });
            }
            try {
                const secret = process.env.JWT_REFRESH_SECRET;
                let decoded;
                if (secret) {
                    decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
                }
                if (typeof decoded !== "object" || !decoded || !decoded.id || !decoded.email) {
                    return res.status(401).json({ message: 'Invalid or expired refresh token' });
                }
                const newAccessToken = (0, authtoken_1.generatetoken)({ id: decoded.id, email: decoded.email });
                res.cookie("agentToken", newAccessToken, {
                    maxAge: 1 * 60 * 1000,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.status(200).json({ success: true, token: newAccessToken });
            }
            catch (error) {
                res.status(401).json({ message: 'Invalid or expired refresh token' });
            }
        });
    }
}
exports.agentController = agentController;
