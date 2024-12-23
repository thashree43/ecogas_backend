import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import stripe from "../../infrastructure/utilis/stripe";
import { IUserData } from "../../domain";
import { generatetoken, generateRefreshToken } from "../middleware/authtoken";
import {
  signupusecase,
  VerifyOtpUseCase,
  ResentotpUseCase,
  loginusecase,
  RequestpasswordUsecase,
  GoogleAuthUseCase,
  Resetpasswordusecase,
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
import { Types } from "mongoose";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
export class userController {
  private readonly jwtsecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private signupusecase: signupusecase,
    private verifyOtpusecase: VerifyOtpUseCase,
    private loginUsecase: loginusecase,
    private googleauthusecase: GoogleAuthUseCase,
    private requestPassword: RequestpasswordUsecase,
    private resetPasswordUsecase: Resetpasswordusecase,
    private resentOtpUseCase: ResentotpUseCase,
    private getProviderUseCase: GetProviderUserSideUseCase,
    private AddingBookUseCase: addbookusecase,
    private GetBookUseCases: GetBookUseCase,
    private DeleteBookUseCase: deletebookusecase,
    private OrderPlaceUseCase: orderplaceusecase,
    private Listordersusecase: listorderusersideusecase,
    private Userchatusecase: usechatusecase,
    private Sendmessageusecase: sendmessageusecase,
    private Getmessageusecase: getmmessageusecase
  ) {
    const secret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!secret || !refreshSecret) {
      throw new Error(
        "JWT secrets (access/refresh) are not set in environment variables"
      );
    }

    this.jwtsecret = secret;
    this.jwtRefreshSecret = refreshSecret;
  }

  // Function to verify and decode the token
  private verifyToken(token: string): {
    id: string;
    email: string;
    iat: number;
    exp: number;
  } {
    try {
      return jwt.verify(token, this.jwtsecret) as {
        id: string;
        email: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  // {USER SIDE --------------------------------------------------------------------------}

  // User register
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { username, email, mobile, password } = req.body;
    try {
      const user = await this.signupusecase.execute(
        username,
        email,
        mobile,
        password
      );
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  // OTP section
  async verifyotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { otp, email } = req.body;
    try {
      const response = await this.verifyOtpusecase.execute(otp, email);
      if (response.success) {
        res.cookie("userToken", response.token, {
          maxAge: 3600000,
           // 1 hour
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: "https://ecogas.fun",
        });
      }
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resendotp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;
    try {
      await this.resentOtpUseCase.execute(email);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // User login part
  async loginuse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email, password } = req.body;
    try {
      const response = await this.loginUsecase.execute(email, password);
      if (response.success) {
        // Generate access and refresh tokens
        const token = generatetoken({ id: response.user._id, email });
        const refreshtoken = generateRefreshToken({
          id: response.user._id,
          email,
        });

        // Set cookies for access and refresh tokens
        res.cookie("userToken", token, {
            maxAge: 3600000, // 1 hour
            httpOnly: true, 
            secure:true,
            sameSite: "none"
        });

        res.cookie("userrefreshToken", refreshtoken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure:true,
          sameSite: "none"
        });

        // Send response with user and tokens
        res
          .status(200)
          .json({ success: true, user: response.user, token, refreshtoken });
        
      } else {
        res.status(400).json({
          success: false,
          message: response.message || "Invalid credentials",
        });
      }
    } catch (error) {
      next(error); // Pass error to the error handling middleware
    }
  }

  async userrefreshtoken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const refreshToken = req.cookies.userrefreshToken;
    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token not provided" });
    }

    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      const decoded = secret
        ? (jwt.verify(refreshToken, secret) as JwtPayload)
        : null;

      if (!decoded || !decoded.id || !decoded.email) {
        // Clear cookies if refresh token is invalid
        res.clearCookie("userToken");
        res.clearCookie("userrefreshToken");
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      // Generate new access and refresh tokens
      const newAccessToken = generatetoken({
        id: decoded.id,
        email: decoded.email,
      });
      const newRefreshToken = generateRefreshToken({
        id: decoded.id,
        email: decoded.email,
      });

      // Set new tokens in cookies
      res.cookie("userToken", newAccessToken, {
        maxAge: 3600000,
        httpOnly: true,
        secure:true, // Ensure this is secure in production
        sameSite: "none", // Required for cross-site cookies
      });
      res.cookie("userrefreshToken", newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        secure:true,
        sameSite: "none"
      });

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ message: "Internal server error" });
      next(error);
    }
  }


  async googleAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { postData } = req.body;
    try {
      const response = await this.googleauthusecase.execute(postData);
      if (response.success && response.user) {
        const token = generatetoken({
          id: response.user._id,
          email: response.user.email,
        });
        const refreshtoken = generateRefreshToken({
          id: response.user._id,
          email: response.user.email,
        });

        res.cookie("userToken", token, {
          maxAge:3600000,
          httpOnly: true,
          secure:true,
          sameSite: "none"
        });

        res.cookie("userrefreshToken", refreshtoken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure:true,
          sameSite: "none"
        });

        res
          .status(200)
          .json({ success: true, user: response.user, token, refreshtoken });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Google authentication failed" });
      }
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Google authentication failed" });
      next(error);
    }
  }

  async forgetpassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;
    try {
      const response = await this.requestPassword.execute(email);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetpassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { newPassword, token } = req.body;
      if (!token || !newPassword) {
        throw new Error("Token or password is missing.");
      }
      const response = await this.resetPasswordUsecase.execute(
        token,
        newPassword
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
  async userlogout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.cookie("userToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
      });

      res.cookie("userrefreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
      });

      res.status(200).json({ message: 'User has been logged out' });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }
  async getprovider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pincode = req.params.pincode;
      const token = req.cookies.userToken;
      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const decodedToken = this.verifyToken(token);
      const providers = await this.getProviderUseCase.execute(pincode);

      if (providers.length === 0) {
        res
          .status(404)
          .json({ message: "No providers found for this pincode" });
      } else {
        res.status(200).json(providers);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // addbook
  async addbook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, consumerId, mobile, address, company, gender } = req.body;
    try {
      const token = req.cookies.userToken;
      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const decodedToken = this.verifyToken(token);
      const userId = decodedToken.id;

      const bookData = await this.AddingBookUseCase.execute(
        userId,
        name,
        consumerId,
        mobile,
        address,
        company,
        gender
      );

      res.status(201).json({
        bookData,
        success: true,
        message: "The book added successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Error adding the book" });
      next(error);
    }
  }

  async getbook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      console.log(userId, "the od fpr yhe user ");

      if (!Types.ObjectId.isValid(userId)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid user ID format" });
        return;
      }

      const books = await this.GetBookUseCases.execute(userId);

      if (books) {
        res.status(200).json({ success: true, books });
      } else {
        res
          .status(404)
          .json({ success: false, message: "User or books not found" });
      }
    } catch (error) {
      console.error("Error in getbook:", error);
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "An unexpected error occurred" });
      }
    }
  }

  async deletebook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const bookId = req.params.bookid;
    const token = req.cookies.userToken;
    try {
      const decodedToken = this.verifyToken(token);
      await this.DeleteBookUseCase.execute(bookId);
      res
        .status(200)
        .json({ success: true, message: "The book has been deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting the book" });
      next(error);
    }
  }

  // ORDER SIDE

  // order placed
  async orderplace(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { selectedProviderId, customerDetails, paymentMethod, selectedGas } =
      req.body;
    console.log("the data reached in the controler");

    const token = req.cookies.userToken;
    try {
      const decodedToken = this.verifyToken(token);
      const userId = decodedToken.id;
      console.log(userId, "the userId may be here ");

      const response = await this.OrderPlaceUseCase.execute(
        userId,
        selectedProviderId,
        customerDetails,
        paymentMethod,
        selectedGas
      );

      if (response.success) {
        res
          .status(200)
          .json({ success: true, message: "Order placed successfully" });
      } else {
        res.status(400).json({ success: false, message: "Order failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error placing the order" });
      next(error);
    }
  }

  // user list orders
  async listorderuserside(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.cookies.userToken;
      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const decodedToken = this.verifyToken(token);
      const userId = decodedToken.id;

      const orders = await this.Listordersusecase.execute(userId);
      if (orders) {
        res.status(200).json(orders);
      } else {
        res.status(404).json({ success: false, message: "No orders found" });
      }
    } catch (error) {
      next(error);
    }
  }

  async userchat(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = req.cookies.userToken;
    try {
      const decodedToken = this.verifyToken(token);
      const userId = decodedToken.id;
      console.log(userId, "User ID from token");

      const result = await this.Userchatusecase.execute(userId);

      res.status(200).json({
        success: true,
        message: "Chat initialized successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in userchat controller:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while initializing chat",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async sendmessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
        image: image ? (req.file as Express.MulterS3.File).location : null
      };

      const result = await this.Sendmessageusecase.execute(
        messageData.content,
        messageData.chatId,
        userId,
        messageData.image
      );

      res.status(200).json({ message: "Message sent successfully", data: result });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message", details: error });
    }
  }
  async getmessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const chatId = req.params.chatid;

    console.log(chatId, "the id for chat ");
    try {
      const messagesData = await this.Getmessageusecase.execute(chatId);

      res.json(messagesData);
    } catch (error) {
      console.error(error);
    }
  }
}
