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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const userroute_1 = require("./interface/route/userroute");
const agentroute_1 = require("./interface/route/agentroute");
const adminroute_1 = require("./interface/route/adminroute");
const mongoconnect_1 = require("./infrastructure/database/mongoconnect");
const logger_1 = __importDefault(require("../src/infrastructure/utilis/logger"));
const morgan_1 = __importDefault(require("morgan"));
const winston_1 = __importDefault(require("winston"));
const database_1 = require("./infrastructure/database");
const ordernotification_1 = require("./infrastructure/cron/ordernotification");
const port = 3000;
(0, mongoconnect_1.connectDb)();
const app = (0, express_1.default)();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow credentials like cookies
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "AgentAuthorization", // Include this custom header
        "Cache-Control",
        "X-Requested-With"
    ],
    exposedHeaders: ["AgentAuthorization"], // If you need to expose any headers to the frontend
    maxAge: 86400 // Cache the preflight response for one day
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, AgentAuthorization');
    next();
});
// Setup Morgan for logging requests
const log = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.DailyRotateFile({
            filename: "logs/application-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "7d",
        }),
    ],
});
// Setup Morgan for logging requests
const morganFormat = ":method :url :status :response-time ms";
app.use((0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(" ")[0],
                url: message.split(" ")[1],
                status: message.split(" ")[2],
                responseTime: message.split(" ")[3],
            };
            logger_1.default.info(JSON.stringify(logObject));
        },
    },
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/user", userroute_1.userroute);
app.use("/api/admin", adminroute_1.adminroute);
app.use("/api/agent", agentroute_1.agentroute);
new ordernotification_1.OrderNotificationCron();
// socket chating part
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
    },
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("setup", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log("UserId:", userId);
            socket.emit("connected");
        }
        else {
            console.log("User ID is undefined");
        }
    });
    // Listen for the join chat event and log the room properly
    socket.on("join chat", (room) => {
        if (room && room._id) {
            socket.join(room._id);
            console.log("Room joined:", room._id);
        }
        else {
            console.log("Room ID is undefined");
        }
    });
    socket.on("new message", (newMessageReceived) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("33333333333333333", newMessageReceived);
        const chatId = newMessageReceived.chat[0];
        try {
            const chat = yield database_1.ChatModel.findById(chatId);
            // Make sure chat users are populated
            if (!chat) {
                console.log("Chat or chat users not available:", chat);
                return;
            }
            const senderId = newMessageReceived.sender[0];
            const recipientIds = newMessageReceived.reciever[0];
            console.log("the recieved ids", recipientIds);
            console.log("00000000000000000000000000", senderId);
            console.log("8888888888888888888", recipientIds);
            if (recipientIds.toString() !== senderId) {
                console.log("55555555555555555555555555555555");
                console.log(`sending message to recipient:`, recipientIds);
                socket
                    .in(recipientIds.toString())
                    .emit("message recieved", newMessageReceived);
            }
        }
        catch (error) {
            console.error("Error in new message event:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
server.listen(port, () => {
    console.log(`The userside server has connected at http://localhost:${port}/api/user`);
    console.log(`The adminside server has connected at http://localhost:${port}/api/admin`);
    console.log(`The brokerside has connected at http://localhost:${port}/api/agent`);
});
