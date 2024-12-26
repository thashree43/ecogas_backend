import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server, Socket } from "socket.io";
import http from "http";
import { createServer } from "http";
import { userroute } from "./interface/route/userroute";
import { agentroute } from "./interface/route/agentroute";
import { adminroute } from "./interface/route/adminroute";
import { connectDb } from "./infrastructure/database/mongoconnect";
import logger from "./infrastructure/utilis/logger";
import morgan from "morgan";
import winston from "winston";
import { ChatModel } from "./infrastructure/database";
import {OrderNotificationCron} from "./infrastructure/cron/ordernotification"


const port = 3000;

connectDb();

const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const clientUrl = process.env.CLIENT_URL!.replace(/\/$/, "");

app.use(
  cors({
    origin: [clientUrl,"http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,  
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "AgentAuthorization",
      "Cache-Control",
      "X-Requested-With"
    ],
    exposedHeaders: ["AgentAuthorization"],  // If you need to expose any headers to the frontend
    maxAge: 86400  // Cache the preflight response for one day
  })
);

app.use((req, res, next) => {
console.log("origin",req.headers.origin);
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, AgentAuthorization'
  );
  next();
});


// Setup Morgan for logging requests
const log = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
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
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userroute);
app.use("/api/admin", adminroute);
app.use("/api/agent", agentroute);
new OrderNotificationCron();

// socket chating part
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log("UserId:", userId);
      socket.emit("connected");
    } else {
      console.log("User ID is undefined");
    }
  });

  // Listen for the join chat event and log the room properly
  socket.on("join chat", (room) => {
    if (room && room._id) {
      socket.join(room._id);
      console.log("Room joined:", room._id);
    } else {
      console.log("Room ID is undefined");
    }
  });
  socket.on("new message", async (newMessageReceived) => {
    console.log("33333333333333333", newMessageReceived);

    const chatId = newMessageReceived.chat[0];
    try {
      const chat = await ChatModel.findById(chatId);
      // Make sure chat users are populated

      if (!chat) {
        console.log("Chat or chat users not available:", chat);
        return;
      }
      const senderId = newMessageReceived.sender[0];
      const recipientIds = newMessageReceived.reciever[0];
      console.log("the recieved ids",recipientIds);
      console.log("00000000000000000000000000",senderId);
      
      console.log("8888888888888888888", recipientIds);
      if (recipientIds.toString() !== senderId) {
        console.log("55555555555555555555555555555555");
        console.log(`sending message to recipient:`, recipientIds);
        socket
          .in(recipientIds.toString())
          .emit("message recieved", newMessageReceived);
      }
    } catch (error) {
      console.error("Error in new message event:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(
    `The userside server has connected at http://localhost:${port}/api/user`
  );
  console.log(
    `The adminside server has connected at http://localhost:${port}/api/admin`
  );
  console.log(
    `The brokerside has connected at http://localhost:${port}/api/agent`
  );
});
