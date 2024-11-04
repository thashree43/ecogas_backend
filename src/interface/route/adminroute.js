"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminroute = void 0;
const express_1 = require("express");
const adminController_1 = require("../controller/adminController");
const repository_1 = require("../../infrastructure/repository");
const usecase_1 = require("../../usecase");
const adminauth_1 = require("../middleware/adminauth");
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
const AdminRepositoryInstance = new repository_1.AdminRepository();
const AdminLoginUseCaseInstance = new usecase_1.Adminloginusecase(AdminRepositoryInstance);
const GetUserUseCaseInstance = new usecase_1.getuserusecase(AdminRepositoryInstance);
const UpdateStatusUseCaseInstance = new usecase_1.updateusecase(AdminRepositoryInstance);
const GetAgentUseCaseInstance = new usecase_1.getagentusecase(AdminRepositoryInstance);
const UpdateApprovalUseCaseInstance = new usecase_1.updateapprovalusecase(AdminRepositoryInstance);
const AdminGetallOrderUseCaseInstance = new usecase_1.admingetallorderusecasse(AdminRepositoryInstance);
const GetCustomerUseCaseInstance = new usecase_1.getcustomerusecase(AdminRepositoryInstance);
const GetMessageUseCaseInstance = new usecase_1.GetMessagesUseCase(AdminRepositoryInstance);
const SendMessageUseCaseInstance = new usecase_1.AdminSendMessageUseCase(AdminRepositoryInstance);
const SaleslistingUseCaseInstance = new usecase_1.saleslitingusecase(AdminRepositoryInstance);
const AdminDashboardUseCaseInstance = new usecase_1.admindashboardusecase(AdminRepositoryInstance);
const AdminControllerInstance = new adminController_1.AdminController(AdminLoginUseCaseInstance, GetUserUseCaseInstance, UpdateStatusUseCaseInstance, GetAgentUseCaseInstance, UpdateApprovalUseCaseInstance, AdminGetallOrderUseCaseInstance, GetCustomerUseCaseInstance, GetMessageUseCaseInstance, SendMessageUseCaseInstance, SaleslistingUseCaseInstance, AdminDashboardUseCaseInstance);
let router = (0, express_1.Router)();
exports.adminroute = router;
router.post("/adminlogin", (req, res, next) => AdminControllerInstance.adminlogin(req, res, next));
router.post("/adminlogout", (req, res, next) => AdminControllerInstance.adminlogout(req, res, next));
router.post("/refresh-token", (req, res, next) => AdminControllerInstance.refreshToken(req, res, next));
router.get("/get_user", adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.getusers(req, res, next));
router.patch("/updatestatus/:id", adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.updatestatus(req, res, next));
router.get("/get_agent", adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.getallagent(req, res, next));
router.patch("/updateapproval/:id", (req, res, next) => AdminControllerInstance.updateapproval(req, res, next));
router.get("/admingetorders", adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.getallorder(req, res, next));
router.get('/getcustomer', (req, res, next) => AdminControllerInstance.getcustomers(req, res, next));
// ---------------------------------------------------------
router.get('/getmessages/:chatId', (req, res, next) => AdminControllerInstance.getMessages(req, res, next));
router.post('/sendmessage', adminauth_1.adminauth, upload.single("image"), (req, res, next) => AdminControllerInstance.sendMessage(req, res, next));
router.get('/saleslists', adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.saleslisting(req, res, next));
router.get("/admindashboard", adminauth_1.adminauth, (req, res, next) => AdminControllerInstance.getdashboard(req, res, next));
