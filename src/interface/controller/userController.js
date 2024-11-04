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
exports.userController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authtoken_1 = require("../middleware/authtoken");
const mongoose_1 = require("mongoose");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
class userController {
    constructor(signupusecase, verifyOtpusecase, loginUsecase, googleauthusecase, requestPassword, resetPasswordUsecase, resentOtpUseCase, getProviderUseCase, AddingBookUseCase, GetBookUseCases, DeleteBookUseCase, OrderPlaceUseCase, Listordersusecase, Userchatusecase, Sendmessageusecase, Getmessageusecase) {
        this.signupusecase = signupusecase;
        this.verifyOtpusecase = verifyOtpusecase;
        this.loginUsecase = loginUsecase;
        this.googleauthusecase = googleauthusecase;
        this.requestPassword = requestPassword;
        this.resetPasswordUsecase = resetPasswordUsecase;
        this.resentOtpUseCase = resentOtpUseCase;
        this.getProviderUseCase = getProviderUseCase;
        this.AddingBookUseCase = AddingBookUseCase;
        this.GetBookUseCases = GetBookUseCases;
        this.DeleteBookUseCase = DeleteBookUseCase;
        this.OrderPlaceUseCase = OrderPlaceUseCase;
        this.Listordersusecase = Listordersusecase;
        this.Userchatusecase = Userchatusecase;
        this.Sendmessageusecase = Sendmessageusecase;
        this.Getmessageusecase = Getmessageusecase;
        const secret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!secret || !refreshSecret) {
            throw new Error("JWT secrets (access/refresh) are not set in environment variables");
        }
        this.jwtsecret = secret;
        this.jwtRefreshSecret = refreshSecret;
    }
    // Function to verify and decode the token
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtsecret);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error("Token expired");
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("Invalid token");
            }
            throw error;
        }
    }
    // {USER SIDE --------------------------------------------------------------------------}
    // User register
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, mobile, password } = req.body;
            try {
                const user = yield this.signupusecase.execute(username, email, mobile, password);
                res.status(200).json({ success: true, user });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // OTP section
    verifyotp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otp, email } = req.body;
            try {
                const response = yield this.verifyOtpusecase.execute(otp, email);
                if (response.success) {
                    res.cookie("userToken", response.token, {
                        maxAge: 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: "strict",
                    });
                }
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    resendotp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                yield this.resentOtpUseCase.execute(email);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // User login part
    loginuse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const response = yield this.loginUsecase.execute(email, password);
                if (response.success) {
                    // Generate access and refresh tokens
                    const token = (0, authtoken_1.generatetoken)({ id: response.user._id, email });
                    const refreshtoken = (0, authtoken_1.generateRefreshToken)({
                        id: response.user._id,
                        email,
                    });
                    // Set cookies for access and refresh tokens
                    res.cookie("userToken", token, {
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                    });
                    res.cookie("userrefreshToken", refreshtoken, {
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                    });
                    // Send response with user and tokens
                    res
                        .status(200)
                        .json({ success: true, user: response.user, token, refreshtoken });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: response.message || "Invalid credentials",
                    });
                }
            }
            catch (error) {
                next(error); // Pass error to the error handling middleware
            }
        });
    }
    userrefreshtoken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.userrefreshToken;
            if (!refreshToken) {
                return res.status(403).json({ message: "Refresh token not provided" });
            }
            try {
                const secret = process.env.JWT_REFRESH_SECRET;
                const decoded = secret
                    ? jsonwebtoken_1.default.verify(refreshToken, secret)
                    : null;
                if (!decoded || !decoded.id || !decoded.email) {
                    res.clearCookie("userToken");
                    res.clearCookie("userrefreshToken");
                    return res
                        .status(401)
                        .json({ message: "Invalid or expired refresh token" });
                }
                const newAccessToken = (0, authtoken_1.generatetoken)({
                    id: decoded.id,
                    email: decoded.email,
                });
                const newRefreshToken = (0, authtoken_1.generateRefreshToken)({
                    id: decoded.id,
                    email: decoded.email,
                });
                res.cookie("userToken", newAccessToken, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.cookie("userrefreshToken", newRefreshToken, {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.status(200).json({
                    success: true,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });
            }
            catch (error) {
                console.error("Error refreshing token:", error);
                res.status(500).json({ message: "Internal server error" });
                next(error);
            }
        });
    }
    googleAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postData } = req.body;
            try {
                const response = yield this.googleauthusecase.execute(postData);
                if (response.success && response.user) {
                    const token = (0, authtoken_1.generatetoken)({
                        id: response.user._id,
                        email: response.user.email,
                    });
                    const refreshtoken = (0, authtoken_1.generateRefreshToken)({
                        id: response.user._id,
                        email: response.user.email,
                    });
                    res.cookie("userToken", token, {
                        maxAge: 1 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                    });
                    res.cookie("userrefreshToken", refreshtoken, {
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res
                        .status(200)
                        .json({ success: true, user: response.user, token, refreshtoken });
                }
                else {
                    res
                        .status(401)
                        .json({ success: false, message: "Google authentication failed" });
                }
            }
            catch (error) {
                res
                    .status(401)
                    .json({ success: false, message: "Google authentication failed" });
                next(error);
            }
        });
    }
    forgetpassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const response = yield this.requestPassword.execute(email);
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetpassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { newPassword, token } = req.body;
                if (!token || !newPassword) {
                    throw new Error("Token or password is missing.");
                }
                const response = yield this.resetPasswordUsecase.execute(token, newPassword);
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    userlogout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.cookie("userToken", "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    expires: new Date(0),
                });
                res.cookie("userrefreshToken", "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    expires: new Date(0),
                });
                res.status(200).json({ message: 'User has been logged out' });
            }
            catch (error) {
                console.error("Error during logout:", error);
                res.status(500).json({ message: 'Logout failed' });
            }
        });
    }
    getprovider(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pincode = req.params.pincode;
                const token = req.cookies.userToken;
                if (!token) {
                    res.status(401).json({ message: "Unauthorized: No token provided" });
                    return;
                }
                const decodedToken = this.verifyToken(token);
                const providers = yield this.getProviderUseCase.execute(pincode);
                if (providers.length === 0) {
                    res
                        .status(404)
                        .json({ message: "No providers found for this pincode" });
                }
                else {
                    res.status(200).json(providers);
                }
            }
            catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    // addbook
    addbook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, consumerId, mobile, address, company, gender } = req.body;
            try {
                const token = req.cookies.userToken;
                if (!token) {
                    res.status(401).json({ message: "Unauthorized: No token provided" });
                    return;
                }
                const decodedToken = this.verifyToken(token);
                const userId = decodedToken.id;
                const bookData = yield this.AddingBookUseCase.execute(userId, name, consumerId, mobile, address, company, gender);
                res.status(201).json({
                    bookData,
                    success: true,
                    message: "The book added successfully",
                });
            }
            catch (error) {
                res.status(500).json({ message: "Error adding the book" });
                next(error);
            }
        });
    }
    getbook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                console.log(userId, "the od fpr yhe user ");
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    res
                        .status(400)
                        .json({ success: false, message: "Invalid user ID format" });
                    return;
                }
                const books = yield this.GetBookUseCases.execute(userId);
                if (books) {
                    res.status(200).json({ success: true, books });
                }
                else {
                    res
                        .status(404)
                        .json({ success: false, message: "User or books not found" });
                }
            }
            catch (error) {
                console.error("Error in getbook:", error);
                if (error instanceof Error) {
                    res.status(500).json({ success: false, message: error.message });
                }
                else {
                    res
                        .status(500)
                        .json({ success: false, message: "An unexpected error occurred" });
                }
            }
        });
    }
    deletebook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookId = req.params.bookid;
            const token = req.cookies.userToken;
            try {
                const decodedToken = this.verifyToken(token);
                yield this.DeleteBookUseCase.execute(bookId);
                res
                    .status(200)
                    .json({ success: true, message: "The book has been deleted" });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting the book" });
                next(error);
            }
        });
    }
    // ORDER SIDE
    // order placed
    orderplace(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { selectedProviderId, customerDetails, paymentMethod, selectedGas } = req.body;
            console.log("the data reached in the controler");
            const token = req.cookies.userToken;
            try {
                const decodedToken = this.verifyToken(token);
                const userId = decodedToken.id;
                console.log(userId, "the userId may be here ");
                const response = yield this.OrderPlaceUseCase.execute(userId, selectedProviderId, customerDetails, paymentMethod, selectedGas);
                if (response.success) {
                    res
                        .status(200)
                        .json({ success: true, message: "Order placed successfully" });
                }
                else {
                    res.status(400).json({ success: false, message: "Order failed" });
                }
            }
            catch (error) {
                res.status(500).json({ message: "Error placing the order" });
                next(error);
            }
        });
    }
    // user list orders
    listorderuserside(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.cookies.userToken;
                if (!token) {
                    res.status(401).json({ message: "Unauthorized: No token provided" });
                    return;
                }
                const decodedToken = this.verifyToken(token);
                const userId = decodedToken.id;
                const orders = yield this.Listordersusecase.execute(userId);
                if (orders) {
                    res.status(200).json(orders);
                }
                else {
                    res.status(404).json({ success: false, message: "No orders found" });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    userchat(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.userToken;
            try {
                const decodedToken = this.verifyToken(token);
                const userId = decodedToken.id;
                console.log(userId, "User ID from token");
                const result = yield this.Userchatusecase.execute(userId);
                res.status(200).json({
                    success: true,
                    message: "Chat initialized successfully",
                    data: result,
                });
            }
            catch (error) {
                console.error("Error in userchat controller:", error);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while initializing chat",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    sendmessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { content, chatid } = req.body;
                const image = req.file;
                console.log("the data from the frontent", image, content, chatid);
                const token = req.cookies.userToken;
                console.log("Request body:", req.body);
                console.log("File:", req.file);
                if (!token) {
                    res.status(401).json({ error: "No authentication token provided" });
                    return;
                }
                const decodedToken = this.verifyToken(token);
                const userId = decodedToken.id;
                if (!chatid) {
                    res.status(400).json({ error: "Chat ID is required" });
                    return;
                }
                if (!content && !image) {
                    res.status(400).json({ error: "Either content or image is required" });
                    return;
                }
                // Create message data object
                const messageData = {
                    content: content || "",
                    chatId: chatid,
                    userId,
                    image: image ? req.file.location : null
                };
                const result = yield this.Sendmessageusecase.execute(messageData.content, messageData.chatId, userId, messageData.image);
                res.status(200).json({ message: "Message sent successfully", data: result });
            }
            catch (error) {
                console.error("Error sending message:", error);
                res.status(500).json({ error: "Failed to send message", details: error });
            }
        });
    }
    getmessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = req.params.chatid;
            console.log(chatId, "the id for chat ");
            try {
                const messagesData = yield this.Getmessageusecase.execute(chatId);
                res.json(messagesData);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.userController = userController;
