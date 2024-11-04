import { Router } from "express";
import { AdminController } from "../controller/adminController";
import { AdminRepository } from "../../infrastructure/repository";
import {
  Adminloginusecase,
  getuserusecase,
  updateusecase,
  getagentusecase,
  updateapprovalusecase,
  admingetallorderusecasse,
  getcustomerusecase,
  GetMessagesUseCase,
  AdminSendMessageUseCase,
  saleslitingusecase,
  admindashboardusecase,

} from "../../usecase";
import { adminauth } from "../middleware/adminauth";
import multer from "multer";
import multerS3 from "multer-s3"; // Import multerS3
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "thashree",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});


const AdminRepositoryInstance = new AdminRepository();

const AdminLoginUseCaseInstance = new Adminloginusecase(
  AdminRepositoryInstance
);
const GetUserUseCaseInstance = new getuserusecase(AdminRepositoryInstance);
const UpdateStatusUseCaseInstance = new updateusecase(AdminRepositoryInstance);
const GetAgentUseCaseInstance = new getagentusecase(AdminRepositoryInstance);
const UpdateApprovalUseCaseInstance = new updateapprovalusecase(
  AdminRepositoryInstance
);
const AdminGetallOrderUseCaseInstance = new admingetallorderusecasse(
  AdminRepositoryInstance
);
const GetCustomerUseCaseInstance = new getcustomerusecase(AdminRepositoryInstance)
const GetMessageUseCaseInstance = new GetMessagesUseCase(AdminRepositoryInstance)
const SendMessageUseCaseInstance = new AdminSendMessageUseCase(AdminRepositoryInstance)
const SaleslistingUseCaseInstance = new saleslitingusecase(AdminRepositoryInstance)
const AdminDashboardUseCaseInstance = new admindashboardusecase(AdminRepositoryInstance)
const AdminControllerInstance = new AdminController(
  AdminLoginUseCaseInstance,
  GetUserUseCaseInstance,
  UpdateStatusUseCaseInstance,
  GetAgentUseCaseInstance,
  UpdateApprovalUseCaseInstance,
  AdminGetallOrderUseCaseInstance,
  GetCustomerUseCaseInstance,
  GetMessageUseCaseInstance,
  SendMessageUseCaseInstance,
  SaleslistingUseCaseInstance,
  AdminDashboardUseCaseInstance,
  
);


let router = Router();
router.post("/adminlogin", (req, res, next) =>
  AdminControllerInstance.adminlogin(req, res, next)
);
router.post("/adminlogout",(req,res,next)=>
AdminControllerInstance.adminlogout(req,res,next))

router.post("/refresh-token", (req, res, next) =>
  AdminControllerInstance.refreshToken(req, res, next)
);
router.get("/get_user",adminauth, (req, res, next) =>
  AdminControllerInstance.getusers(req, res, next)
);
router.patch(
  "/updatestatus/:id",
  adminauth,
  (req, res, next) => AdminControllerInstance.updatestatus(req, res, next)
);
router.get("/get_agent", adminauth, (req, res, next) =>
  AdminControllerInstance.getallagent(req, res, next)
);
router.patch("/updateapproval/:id", (req, res, next) =>
  AdminControllerInstance.updateapproval(req, res, next)
);
router.get(
  "/admingetorders",
  adminauth,
  (req, res, next) => AdminControllerInstance.getallorder(req, res, next)
);
router.get('/getcustomer',(req,res,next)=>
  AdminControllerInstance.getcustomers(req,res,next))

// ---------------------------------------------------------
router.get('/getmessages/:chatId', (req, res, next) =>
  AdminControllerInstance.getMessages(req, res, next)
);

router.post('/sendmessage', adminauth,upload.single("image"),(req, res, next) =>
  AdminControllerInstance.sendMessage(req, res, next)
);
router.get('/saleslists',adminauth,(req,res,next)=>
AdminControllerInstance.saleslisting(req,res,next)
)
router.get("/admindashboard",adminauth,(req,res,next)=>
AdminControllerInstance.getdashboard(req,res,next)
)
export { router as adminroute };
