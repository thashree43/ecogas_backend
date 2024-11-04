"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userroute = void 0;
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const usecase_1 = require("../../usecase");
const repository_1 = require("../../infrastructure/repository");
const Otpservice_1 = require("../../infrastructure/service/Otpservice");
const userauth_1 = require("../middleware/userauth");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3")); // Import multerS3
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3Client,
        bucket: "thashree",
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname);
        },
    }),
});
// Create instances of repositories, services, and use cases
const userRepositoryInstance = new repository_1.UserRepository();
const OtpServiceInstance = new Otpservice_1.Otpservice();
const redisOtpRepositoryInstance = new repository_1.RedisOtpRepository();
const agentRepositoryInstance = new repository_1.AgentRepository();
const googleAuthUseCaseInstance = new usecase_1.GoogleAuthUseCase(userRepositoryInstance);
const signupUseCaseInstance = new usecase_1.signupusecase(userRepositoryInstance, OtpServiceInstance, redisOtpRepositoryInstance);
const verifyOtpInstance = new usecase_1.VerifyOtpUseCase(redisOtpRepositoryInstance, userRepositoryInstance);
const loginusecaseInstance = new usecase_1.loginusecase(userRepositoryInstance);
const requestPasswordUseCaseInstance = new usecase_1.RequestpasswordUsecase(userRepositoryInstance, redisOtpRepositoryInstance, OtpServiceInstance);
const resetPasswordUseCaseInstance = new usecase_1.Resetpasswordusecase(userRepositoryInstance, redisOtpRepositoryInstance);
const resentOtpUseCaseInstance = new usecase_1.ResentotpUseCase(OtpServiceInstance, redisOtpRepositoryInstance);
const GetproviderUseCaseInstance = new usecase_1.GetProviderUserSideUseCase(agentRepositoryInstance);
const AddBookUseCaseInstance = new usecase_1.addbookusecase(userRepositoryInstance);
const GetBookUseCaseInstance = new usecase_1.GetBookUseCase(userRepositoryInstance);
const DeleteBookUseCaseInstance = new usecase_1.deletebookusecase(userRepositoryInstance);
const OrderPlaceUseCaseInstance = new usecase_1.orderplaceusecase(userRepositoryInstance);
const ListOrderUserSideUseCaseInstance = new usecase_1.listorderusersideusecase(userRepositoryInstance);
const UserChatUseCaseInstance = new usecase_1.usechatusecase(userRepositoryInstance);
const SendMessageUseCaseInstance = new usecase_1.sendmessageusecase(userRepositoryInstance);
const GetMessageUseCaseInstance = new usecase_1.getmmessageusecase(userRepositoryInstance);
// instances of the user controller
const userControllerInstance = new userController_1.userController(signupUseCaseInstance, verifyOtpInstance, loginusecaseInstance, googleAuthUseCaseInstance, requestPasswordUseCaseInstance, resetPasswordUseCaseInstance, resentOtpUseCaseInstance, GetproviderUseCaseInstance, AddBookUseCaseInstance, GetBookUseCaseInstance, DeleteBookUseCaseInstance, OrderPlaceUseCaseInstance, ListOrderUserSideUseCaseInstance, UserChatUseCaseInstance, SendMessageUseCaseInstance, GetMessageUseCaseInstance);
const router = (0, express_1.Router)();
exports.userroute = router;
// Define routes
router.post("/register", (req, res, next) => userControllerInstance.signup(req, res, next));
router.post("/verifyotp", (req, res, next) => userControllerInstance.verifyotp(req, res, next));
router.post("/resendotp", (req, res, next) => userControllerInstance.resendotp(req, res, next));
router.post("/login", (req, res, next) => userControllerInstance.loginuse(req, res, next));
router.post("/google-login", (req, res, next) => userControllerInstance.googleAuth(req, res, next));
router.post("/userrefresh-token", (req, res, next) => userControllerInstance.userrefreshtoken(req, res, next));
router.post("/resetpassword", (req, res, next) => userControllerInstance.forgetpassword(req, res, next));
router.patch("/updatepassword", (req, res, next) => userControllerInstance.resetpassword(req, res, next));
router.post('/logout', (req, res, next) => userControllerInstance.userlogout(req, res, next));
router.get("/gas-providers/:pincode", userauth_1.userauth, (req, res, next) => userControllerInstance.getprovider(req, res, next));
router.post("/addbook", userauth_1.userauth, (req, res, next) => userControllerInstance.addbook(req, res, next));
router.get("/getbook/:userId", (req, res, next) => userControllerInstance.getbook(req, res, next));
router.delete("/deletebook/:bookid", userauth_1.userauth, (req, res, next) => userControllerInstance.deletebook(req, res, next));
router.post("/ordergas", (req, res, next) => userControllerInstance.orderplace(req, res, next));
router.get('/getorders/:id', userauth_1.userauth, (req, res, next) => userControllerInstance.listorderuserside(req, res, next));
// chat routes 
router.post('/userchat/:uderId', (req, res, next) => userControllerInstance.userchat(req, res, next));
router.post('/sendmessages', userauth_1.userauth, upload.single("image"), (req, res, next) => userControllerInstance.sendmessages(req, res, next));
router.get("/getmessage/:chatid", (req, res, next) => userControllerInstance.getmessages(req, res, next));
