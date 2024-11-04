import { NextFunction, Request, Response } from "express";
import {
  Agentapplyusecase,
  agentloginusecase,
  ProductAddingUsecase,
  listingproductusecase,
  EditProductUseCase,
  DeleteProductUseCase,
  getordersfromagentusecase,
  updateorderstatususecase,
  agentsaleslistusecase,
  agentdashboardusecase,

} from "../../usecase";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { generateRefreshToken, generatetoken } from "../middleware/authtoken";
import { log } from "winston";

export class agentController {
  private jwtSecret!: string;

  constructor(
    private agentApplyUsecase: Agentapplyusecase,
    private agentLoginUseCase: agentloginusecase,
    private productAddingusecase: ProductAddingUsecase,
    private ListingProductUseCase: listingproductusecase,
    private EditProductUseCase: EditProductUseCase,
    private DeleteproductUseCase: DeleteProductUseCase,
    private GetordersfromAgent: getordersfromagentusecase,
    private UpdateOrderStatus: updateorderstatususecase,
    private Agentsaleslistusecase:agentsaleslistusecase,
    private AgentDashboarusecase:agentdashboardusecase

  ) {
    this.jwtSecret = process.env.JWT_ACCESS_SECRET || "default_jwt_secret";
  }

  agentregister = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log("Controller reached. Request body:", req.body);
    console.log("File:", req.file);
    try {
      if (!req.file) {
        res.status(400).json({ message: "Image file is required" });
        return;
      }

      const agentData = {
        agentname: req.body.agentname,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        pincode: req.body.pincode,
        image: (req.file as Express.MulterS3.File).location,
      };

      const savedAgent = await this.agentApplyUsecase.applyAgent(agentData);
      res
        .status(201)
        .json({ message: "Agent application submitted", agent: savedAgent });
    } catch (error) {
      console.error("Error in agent registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  agentlogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    try {
      const response = await this.agentLoginUseCase.execute(email, password)

      if (response.success && response.agent) {
        const token = generatetoken({ id: response.agent._id.toString(), email });
        const refreshToken = generateRefreshToken({ id: response.agent._id.toString(), email });

        res.cookie("agentToken", token, {
          maxAge: 60* 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.cookie("agentRefreshToken", refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        res.status(200).json({
          success: true,
          agent: response.agent,
          token,
          
        });
      } else {
        res.status(401).json({
          success: false,
          message: response.message || "Login failed",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  async agentrefreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.agentRefreshToken;

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

      const newAccessToken = generatetoken({ id: decoded.id, email: decoded.email });

      res.cookie("agentToken", newAccessToken, {
        maxAge: 1 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ success: true, token: newAccessToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }
agentlogout = async(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie("agentToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.cookie("agentRefreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.status(200).json({ message: 'Agent has been logged out' });
  } catch (error) {
    
  }
}

  addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { companyName, kg, price, quantity } = req.body;
    const token = req.cookies.agentToken;

    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as {
        id: string;
      };
      const agentId = decodedToken.id;

      const productData = {
        companyname: companyName,
        weight: kg,
        price: price,
        quantity: quantity,
      };

      const addedProduct = await this.productAddingusecase.addProduct(
        agentId,
        productData
      );

      if (!addedProduct) {
        res.status(409).json({
          success: false,
          message: "Product with the same name already exists.",
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: "Product added",
        product: addedProduct,
      });
    } catch (error) {
      console.error("Error in adding product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  listproduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.cookies.agentToken;
    console.log(" the tokenin the controller ",token);
    
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as {
        id: string;
      };
      console.log(decodedToken,"ythe decoded toen ");
      
      const agentId = decodedToken.id;
      console.log(agentId,"the id in the cintrolagent");
      
      const products = await this.ListingProductUseCase.execute(agentId);

      res.status(200).json({ success: true, products });
    } catch (error) {
      console.error("the error may occured here", error);
      res.status(500).json({ message: "Internal error" });
    }
  };

  editproduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { _id, companyname, weight, price, quantity } = req.body;

    console.log("The ID is this for editing product:", _id);
    console.log("The data from the body:", req.body);

    try {
      // Ensure _id is a valid ObjectId
      const productId = new Types.ObjectId(_id); // Use 'Types.ObjectId' instead of 'Schema.Types.ObjectId'

      // Create the product object
      const productData = {
        _id: productId,
        companyname,
        weight,
        price,
        quantity,
      };

      // Update the product
      console.log("The use case reached");

      const updatedProduct = await this.EditProductUseCase.execute(productData);

      if (!updatedProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("The error may have occurred here:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log(req.params.id, "while deleting the product");
    try {
      const id = req.params.id;
      await this.DeleteproductUseCase.execute(id);
      res
        .status(200)
        .json({ message: "Product deleted successfully", success: true });
    } catch (error) {
      console.error("Error occurred while deleting the product:", error);
      res.status(500).json({ message: "Error deleting the product" });
    }
  };
  getordersin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.cookies.agentToken;
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as {
        id: string;
      };
      const agentId = decodedToken.id;
      const result = await this.GetordersfromAgent.execute(agentId);
      console.log(result, "the datas in the control");

      if (result) {
        res.status(200).json({ success: true, result });
      } else {
        res.status(404).json({ success: false, message: "No orders found" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
  statusupdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const id = req.params.orderid;
    console.log(id, "the data make the update in status ");
    try {
      const data = await this.UpdateOrderStatus.execute(id);
      console.log("updated status");

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          success: false,
          error: "An error occurred while updating the order status",
        });
    }
  };
  getsaleslists = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const agentId = req.params.agentid;
      console.log("ID for listing sales:", agentId);

      const data = await this.Agentsaleslistusecase.execute(agentId);
      
      if (!data) {
        res.status(404).json({ success: false, message: "No sales data found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error("Error while getting sales:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }
  getdashboard = async(
    req:Request,
    res:Response,
    next:NextFunction
  ):Promise<void>=>{
    const token = req.cookies.agentToken;
    console.log(" the tokenin the controller ",token);
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as {
        id: string;
      };
      console.log(decodedToken,"ythe decoded toen ");
      
      const agentId = decodedToken.id;
      console.log("agentid be thus ",agentId);
      const datas = await this.AgentDashboarusecase.execute(agentId)
      

      res.json(datas)
    } catch (error) {
      console.error(error);
      
    }
  }
}
