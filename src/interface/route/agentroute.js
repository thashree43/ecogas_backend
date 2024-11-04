"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentroute = void 0;
const express_1 = require("express");
const brokerController_1 = require("../controller/brokerController");
const usecase_1 = require("../../usecase");
const repository_1 = require("../../infrastructure/repository");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const agentauth_1 = require("../middleware/agentauth");
(0, dotenv_1.config)();
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
// const uploadDir = path.join(__dirname, '..', '..', '..', '../../infrastructure/uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });
// Repository Instance
const AgentRepositoryInstance = new repository_1.AgentRepository();
// Usecase Instance
const AgentApplyUsecaseInstance = new usecase_1.Agentapplyusecase(AgentRepositoryInstance);
const AgentLoginUseCaseInstance = new usecase_1.agentloginusecase(AgentRepositoryInstance);
const ProductAddingUseCaseInstance = new usecase_1.ProductAddingUsecase(AgentRepositoryInstance);
const ListingProductUseCaseInstance = new usecase_1.listingproductusecase(AgentRepositoryInstance);
const EditProductUseCaseInstance = new usecase_1.EditProductUseCase(AgentRepositoryInstance);
const DeleteProductUseCaseInstance = new usecase_1.DeleteProductUseCase(AgentRepositoryInstance);
const GetOrdersFromAgentUseCaseInstance = new usecase_1.getordersfromagentusecase(AgentRepositoryInstance);
const UpdateOrderStatusUseCaseInstance = new usecase_1.updateorderstatususecase(AgentRepositoryInstance);
const AgentSalesListUseCaseInstance = new usecase_1.agentsaleslistusecase(AgentRepositoryInstance);
const AgentDashboardUseCaseInstance = new usecase_1.agentdashboardusecase(AgentRepositoryInstance);
// conntroller
const agentControllerInstance = new brokerController_1.agentController(AgentApplyUsecaseInstance, AgentLoginUseCaseInstance, ProductAddingUseCaseInstance, ListingProductUseCaseInstance, EditProductUseCaseInstance, DeleteProductUseCaseInstance, GetOrdersFromAgentUseCaseInstance, UpdateOrderStatusUseCaseInstance, AgentSalesListUseCaseInstance, AgentDashboardUseCaseInstance);
const router = (0, express_1.Router)();
exports.agentroute = router;
router.post("/apply", upload.single("image"), agentControllerInstance.agentregister);
router.post("/agentlogin", agentControllerInstance.agentlogin);
router.post("/agentrefresh-token", (req, res, next) => agentControllerInstance.agentrefreshToken(req, res, next));
router.post('/agentlogout', agentControllerInstance.agentlogout);
router.post("/addproduct", agentauth_1.agentauth, agentControllerInstance.addProduct);
router.get("/getproduct", agentauth_1.agentauth, agentControllerInstance.listproduct);
router.patch("/editproduct", agentauth_1.agentauth, agentControllerInstance.editproduct);
router.delete("/deleteproduct/:id", agentauth_1.agentauth, agentControllerInstance.deleteProduct);
router.get("/agentgetorders", agentauth_1.agentauth, agentControllerInstance.getordersin);
router.patch("/orderstatus/:orderid", agentauth_1.agentauth, agentControllerInstance.statusupdate);
router.get("/getsales/:agentid", agentauth_1.agentauth, agentControllerInstance.getsaleslists);
router.get("/agentdashboard", agentauth_1.agentauth, agentControllerInstance.getdashboard);
const express_2 = __importDefault(require("express"));
const app = (0, express_2.default)();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
});
