import { Router } from "express";
import { userController } from "../controller/userController";
import {
  signupusecase,
  VerifyOtpUseCase,
  loginusecase,
  RequestpasswordUsecase,
  GoogleAuthUseCase,
  Resetpasswordusecase,
  ResentotpUseCase,
  GetProviderUserSideUseCase,
  addbookusecase,
  GetBookUseCase,
  deletebookusecase,
  orderplaceusecase,
  listorderusersideusecase,
  usechatusecase,
  sendmessageusecase,
  getmmessageusecase,
} from "../../usecase";
import {
  UserRepository,
  RedisOtpRepository,
  AgentRepository,
} from "../../infrastructure/repository";
import { Otpservice } from "../../infrastructure/service/Otpservice";
import { userauth } from "../middleware/userauth";
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
// Create instances of repositories, services, and use cases
const userRepositoryInstance = new UserRepository();
const OtpServiceInstance = new Otpservice();
const redisOtpRepositoryInstance = new RedisOtpRepository();
const agentRepositoryInstance = new AgentRepository();

const googleAuthUseCaseInstance = new GoogleAuthUseCase(userRepositoryInstance);
const signupUseCaseInstance = new signupusecase(
  userRepositoryInstance,
  OtpServiceInstance,
  redisOtpRepositoryInstance
);
const verifyOtpInstance = new VerifyOtpUseCase(
  redisOtpRepositoryInstance,
  userRepositoryInstance
);
const loginusecaseInstance = new loginusecase(userRepositoryInstance);
const requestPasswordUseCaseInstance = new RequestpasswordUsecase(
  userRepositoryInstance,
  redisOtpRepositoryInstance,
  OtpServiceInstance
);
const resetPasswordUseCaseInstance = new Resetpasswordusecase(
  userRepositoryInstance,
  redisOtpRepositoryInstance
);
const resentOtpUseCaseInstance = new ResentotpUseCase(
  OtpServiceInstance,
  redisOtpRepositoryInstance
);
const GetproviderUseCaseInstance = new GetProviderUserSideUseCase(
  agentRepositoryInstance
);
const AddBookUseCaseInstance = new addbookusecase(userRepositoryInstance);
const GetBookUseCaseInstance = new GetBookUseCase(userRepositoryInstance);
const DeleteBookUseCaseInstance = new deletebookusecase(userRepositoryInstance);

const OrderPlaceUseCaseInstance = new orderplaceusecase(userRepositoryInstance);
const ListOrderUserSideUseCaseInstance = new listorderusersideusecase(userRepositoryInstance)
const UserChatUseCaseInstance = new usechatusecase(userRepositoryInstance)
const SendMessageUseCaseInstance = new sendmessageusecase(userRepositoryInstance);
const GetMessageUseCaseInstance = new getmmessageusecase(userRepositoryInstance)
// instances of the user controller
const userControllerInstance = new userController(
  signupUseCaseInstance,
  verifyOtpInstance,
  loginusecaseInstance,
  googleAuthUseCaseInstance,
  requestPasswordUseCaseInstance,
  resetPasswordUseCaseInstance,
  resentOtpUseCaseInstance,
  GetproviderUseCaseInstance,
  AddBookUseCaseInstance,
  GetBookUseCaseInstance,
  DeleteBookUseCaseInstance,
  OrderPlaceUseCaseInstance,
  ListOrderUserSideUseCaseInstance,
  UserChatUseCaseInstance,
  SendMessageUseCaseInstance,
  GetMessageUseCaseInstance
);

const router = Router();

// Define routes
router.post("/register", (req, res, next) =>
  userControllerInstance.signup(req, res, next)
);
router.post("/verifyotp", (req, res, next) =>
  userControllerInstance.verifyotp(req, res, next)
);
router.post("/resendotp", (req, res, next) =>
  userControllerInstance.resendotp(req, res, next)
);
router.post("/login", (req, res, next) =>
  userControllerInstance.loginuse(req, res, next)
);
router.post("/google-login", (req, res, next) =>
  userControllerInstance.googleAuth(req, res, next)
);
router.post("/userrefresh-token", (req, res, next) =>
  userControllerInstance.userrefreshtoken(req, res, next))
router.post("/resetpassword", (req, res, next) =>
  userControllerInstance.forgetpassword(req, res, next)
);
router.patch("/updatepassword", (req, res, next) =>
  userControllerInstance.resetpassword(req, res, next)
);
router.post('/logout',(req,res,next)=>
userControllerInstance.userlogout(req,res,next))

router.get(
  "/gas-providers/:pincode",
  userauth,
  (req, res, next) => userControllerInstance.getprovider(req, res, next)
);

router.post("/addbook", userauth, (req, res, next) =>
  userControllerInstance.addbook(req, res, next)
);

router.get("/getbook/:userId", (req, res, next) =>
  userControllerInstance.getbook(req, res, next)
);

router.delete(
  "/deletebook/:bookid",
  userauth,
  (req, res, next) => userControllerInstance.deletebook(req, res, next)
);

router.post("/ordergas", (req, res, next) =>
  userControllerInstance.orderplace(req, res, next)
);

router.get('/getorders/:id', userauth, (req, res, next) => userControllerInstance.listorderuserside(req, res, next))

// chat routes 
router.post('/userchat/:uderId', (req, res, next) =>
  userControllerInstance.userchat(req, res, next))

router.post('/sendmessages',userauth,upload.single("image"),(req,res,next)=>
userControllerInstance.sendmessages(req,res,next))

router.get("/getmessage/:chatid",(req,res,next)=>
userControllerInstance.getmessages(req,res,next)
)


export { router as userroute };

