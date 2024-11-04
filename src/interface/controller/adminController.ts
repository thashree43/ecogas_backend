import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken";
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
import nodemailer from "nodemailer";
import {generateRefreshToken, generatetoken} from "../../interface/middleware/authtoken"
export class AdminController {
 
  private readonly jwtsecret: string; 
  private readonly jwtRefreshSecret: string;
  constructor(
    private adminloginUsecase: Adminloginusecase,
    private getUserusecase:getuserusecase,
    private updateUseCase:updateusecase,
    private getAgentUseCaseInstance: getagentusecase,
    private UpdateApprovalUseCaseInstance: updateapprovalusecase,
    private AdminGetallOrdersInstance: admingetallorderusecasse,
    private GetCustomeUseCaseInstance:getcustomerusecase,
    private GetMessagesUseCaseInstance:GetMessagesUseCase,
    private SendMessageUseCaseInstance:AdminSendMessageUseCase,
    private SaleslistingUseCaseInstance:saleslitingusecase,
    private AdminDashboardusecase:admindashboardusecase,

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

  async adminlogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;

    try {
      const response = await this.adminloginUsecase.execute(email, password);

      if (response.success) {
        const token = generatetoken({ id: response.admin._id, email });
        const refreshToken = generateRefreshToken({ id: response.admin._id, email });

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
      } else {
        res.status(401).json({ success: false, message: response.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;
    console.log("refresh token in the controller the refresh part ",refreshToken);
    
    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token not provided' });
    }

    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      let decoded: string | JwtPayload | undefined;

      if (secret) {
        decoded = jwt.verify(refreshToken, secret) as JwtPayload;
      }

      if (typeof decoded !== "object" || !decoded || !decoded.id || !decoded.email) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      // Generate new access token
      const newAccessToken = generatetoken({ id: decoded.id, email: decoded.email });
      const newRefreshToken = generateRefreshToken({ id: decoded.id, email: decoded.email });

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
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }


  async adminlogout(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }
  // Listing Users in adminside
  async getusers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.getUserusecase.execute();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
  // Block & Unblock
  async updatestatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { is_blocked } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: "User ID not provided" });
      return;
    }

    try {
      const updatedUser = await this.updateUseCase.execute(id, { is_blocked });

      if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      console.log("User status updated:", updatedUser);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating user status:", error);
      next(error);
    }
  }
  async getallagent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const agents = await this.getAgentUseCaseInstance.execute(); // Call the use case
      res.status(200).json({ success: true, agents }); // Respond with the agent list
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch agents" });
    }
  }
  async updateapproval(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { is_Approved } = req.body;

    console.log(id, is_Approved, "from  the admin side ");
    if (!id) {
      res.status(400).json({ success: false, message: "User ID not provided" });
      return;
    }

    try {
      const updateapproval = await this.UpdateApprovalUseCaseInstance.execute(
        id,
        { is_Approved }
      );
      if (!updateapproval) {
        res.status(404).json({ success: false, message: "agnet not found" });
        return;
      }
      res.status(200).json({ success: true, agent: updateapproval });
      const approvalStatus = is_Approved ? "Approved" : "Rejected";
      await this.sendApprovalEmail(
        updateapproval.email,
        approvalStatus,
        updateapproval.agentname
      );

      res.status(200).json({ success: true, agent: updateapproval });
    } catch (error) {
      next(error);
    }
  }

  // Email sending method
  private async sendApprovalEmail(
    email: string,
    status: string,
    agentName: string
  ) {
    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
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
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email} with status: ${status}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email sending failed");
    }
  }
  async getallorder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orders = await this.AdminGetallOrdersInstance.execute();
      res.status(200).send({ success: true, orders });
    } catch (error) {
      console.error(error);
    }
  }
  async getcustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customersData = await this.GetCustomeUseCaseInstance.execute();
      res.json(customersData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching customers" });
    }
  }
  
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      console.log("admin chatid getmessage  ",chatId);
      
      const messages = await this.GetMessagesUseCaseInstance.execute(chatId);

      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  }

  async  sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId, content } = req.body;
      const image = req.file
      console.log(chatId,"the whole datas");
      

      
      const admintoken = req.cookies.adminToken;
      if (!admintoken) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }
      const decodedToken = this.verifyToken(admintoken);
      const adminId = decodedToken.id

      let imageUrl: string | null = null;
      if (image) {
        imageUrl = image ?(req.file as Express.MulterS3.File).location : null  // AWS S3 URL
      }

      console.log(adminId,"the adminId in the control");

      const message = await this.SendMessageUseCaseInstance.execute(chatId,adminId, content,imageUrl);
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending message" });
    }
  }
  async saleslisting(req: Request, res: Response, next: NextFunction) {
    try {
      
      const salesdatas = await this.SaleslistingUseCaseInstance.execute()
      res.json(salesdatas)
    } catch (error) {
      console.error(error,"error occured while getting sales lists");
      throw new Error("error may occured")
      
    }
  }
  async getdashboard(req: Request, res: Response, next: NextFunction){
    try {
      const dashboardData = await this.AdminDashboardusecase.execute();
      console.log("the datas in the admin dashbpard",dashboardData);
      
      res.status(200).json(dashboardData);
    } catch (error) {
      console.error(error);
      console.log("error in the controller admin side ");
      
      
    }
  }
}


