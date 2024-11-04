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
exports.AdminController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const authtoken_1 = require("../../interface/middleware/authtoken");
class AdminController {
    constructor(adminloginUsecase, getUserusecase, updateUseCase, getAgentUseCaseInstance, UpdateApprovalUseCaseInstance, AdminGetallOrdersInstance, GetCustomeUseCaseInstance, GetMessagesUseCaseInstance, SendMessageUseCaseInstance, SaleslistingUseCaseInstance, AdminDashboardusecase) {
        this.adminloginUsecase = adminloginUsecase;
        this.getUserusecase = getUserusecase;
        this.updateUseCase = updateUseCase;
        this.getAgentUseCaseInstance = getAgentUseCaseInstance;
        this.UpdateApprovalUseCaseInstance = UpdateApprovalUseCaseInstance;
        this.AdminGetallOrdersInstance = AdminGetallOrdersInstance;
        this.GetCustomeUseCaseInstance = GetCustomeUseCaseInstance;
        this.GetMessagesUseCaseInstance = GetMessagesUseCaseInstance;
        this.SendMessageUseCaseInstance = SendMessageUseCaseInstance;
        this.SaleslistingUseCaseInstance = SaleslistingUseCaseInstance;
        this.AdminDashboardusecase = AdminDashboardusecase;
        const secret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!secret || !refreshSecret) {
            throw new Error("JWT secrets (access/refresh) are not set in environment variables");
        }
        this.jwtsecret = secret;
        this.jwtRefreshSecret = refreshSecret;
    }
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
    adminlogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const response = yield this.adminloginUsecase.execute(email, password);
                if (response.success) {
                    const token = (0, authtoken_1.generatetoken)({ id: response.admin._id, email });
                    const refreshToken = (0, authtoken_1.generateRefreshToken)({ id: response.admin._id, email });
                    res.cookie("adminToken", token, {
                        maxAge: 1 * 60 * 1000, // 1 hour
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res.cookie("refreshToken", refreshToken, {
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                    });
                    res.status(200).json({
                        success: true,
                        admin: response.admin,
                        token,
                    });
                }
                else {
                    res.status(401).json({ success: false, message: response.message });
                }
            }
            catch (error) {
                console.error("Login error:", error);
                next(error);
            }
        });
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            console.log("refresh token in the controller the refresh part ", refreshToken);
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
                // Generate new access token
                const newAccessToken = (0, authtoken_1.generatetoken)({ id: decoded.id, email: decoded.email });
                const newRefreshToken = (0, authtoken_1.generateRefreshToken)({ id: decoded.id, email: decoded.email });
                res.cookie("adminToken", newAccessToken, {
                    maxAge: 5 * 60 * 1000, // 5 minutes
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.cookie("refreshToken", newRefreshToken, {
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.status(200).json({ success: true, token: newAccessToken, refreshToken: newRefreshToken });
            }
            catch (error) {
                res.status(401).json({ message: 'Invalid or expired refresh token' });
            }
        });
    }
    adminlogout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.cookie("adminToken", "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    expires: new Date(0),
                });
                res.cookie("refreshToken", "", {
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
    // Listing Users in adminside
    getusers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.getUserusecase.execute();
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Block & Unblock
    updatestatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { is_blocked } = req.body;
            if (!id) {
                res.status(400).json({ success: false, message: "User ID not provided" });
                return;
            }
            try {
                const updatedUser = yield this.updateUseCase.execute(id, { is_blocked });
                if (!updatedUser) {
                    res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                console.log("User status updated:", updatedUser);
                res.status(200).json({ success: true });
            }
            catch (error) {
                console.error("Error updating user status:", error);
                next(error);
            }
        });
    }
    getallagent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agents = yield this.getAgentUseCaseInstance.execute(); // Call the use case
                res.status(200).json({ success: true, agents }); // Respond with the agent list
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to fetch agents" });
            }
        });
    }
    updateapproval(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { is_Approved } = req.body;
            console.log(id, is_Approved, "from  the admin side ");
            if (!id) {
                res.status(400).json({ success: false, message: "User ID not provided" });
                return;
            }
            try {
                const updateapproval = yield this.UpdateApprovalUseCaseInstance.execute(id, { is_Approved });
                if (!updateapproval) {
                    res.status(404).json({ success: false, message: "agnet not found" });
                    return;
                }
                res.status(200).json({ success: true, agent: updateapproval });
                const approvalStatus = is_Approved ? "Approved" : "Rejected";
                yield this.sendApprovalEmail(updateapproval.email, approvalStatus, updateapproval.agentname);
                res.status(200).json({ success: true, agent: updateapproval });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Email sending method
    sendApprovalEmail(email, status, agentName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Configure Nodemailer transporter
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail", // You can use other services or SMTP
                auth: {
                    user: process.env.EMAIL_USER, // Use your email
                    pass: process.env.EMAIL_PASS, // Use your password
                },
            });
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Your Agent Account is ${status}`,
                text: `Hello ${agentName},\n\nYour agent account has been ${status}.`,
            };
            // Send email
            try {
                yield transporter.sendMail(mailOptions);
                console.log(`Email sent to ${email} with status: ${status}`);
            }
            catch (error) {
                console.error("Error sending email:", error);
                throw new Error("Email sending failed");
            }
        });
    }
    getallorder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield this.AdminGetallOrdersInstance.execute();
                res.status(200).send({ success: true, orders });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getcustomers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customersData = yield this.GetCustomeUseCaseInstance.execute();
                res.json(customersData);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Error fetching customers" });
            }
        });
    }
    getMessages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { chatId } = req.params;
                console.log("admin chatid getmessage  ", chatId);
                const messages = yield this.GetMessagesUseCaseInstance.execute(chatId);
                res.json(messages);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Error fetching messages" });
            }
        });
    }
    sendMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { chatId, content } = req.body;
                const image = req.file;
                console.log(chatId, "the whole datas");
                const admintoken = req.cookies.adminToken;
                if (!admintoken) {
                    res.status(401).json({ message: "Unauthorized: No token provided" });
                    return;
                }
                const decodedToken = this.verifyToken(admintoken);
                const adminId = decodedToken.id;
                let imageUrl = null;
                if (image) {
                    imageUrl = image ? req.file.location : null; // AWS S3 URL
                }
                console.log(adminId, "the adminId in the control");
                const message = yield this.SendMessageUseCaseInstance.execute(chatId, adminId, content, imageUrl);
                res.json(message);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Error sending message" });
            }
        });
    }
    saleslisting(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salesdatas = yield this.SaleslistingUseCaseInstance.execute();
                res.json(salesdatas);
            }
            catch (error) {
                console.error(error, "error occured while getting sales lists");
                throw new Error("error may occured");
            }
        });
    }
    getdashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboardData = yield this.AdminDashboardusecase.execute();
                console.log("the datas in the admin dashbpard", dashboardData);
                res.status(200).json(dashboardData);
            }
            catch (error) {
                console.error(error);
                console.log("error in the controller admin side ");
            }
        });
    }
}
exports.AdminController = AdminController;
