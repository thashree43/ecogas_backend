import { AgentProduct } from "../domain";
import { IProductDocument } from "../infrastructure/database";
import { IAgentRepository } from "../domain";
import { Types } from "mongoose";

export class EditProductUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(productData: AgentProduct): Promise<IProductDocument | null> {
    const { _id, companyname, weight, price, quantity } = productData;

    if (!_id) {
      throw new Error("Product ID is required");
    }

    // Ensure _id is either a string or ObjectId
    let productId: string | Types.ObjectId;
    
    if (typeof _id === "string" && Types.ObjectId.isValid(_id)) {
      productId =new Types.ObjectId(_id); // Convert to ObjectId if it's a valid string
    } else if (_id instanceof Types.ObjectId) {
      productId = _id; // If already ObjectId, use it directly
    } else {
      throw new Error("Invalid Product ID");
    }

    try {
      // Update the product using the repository method
      const data = await this.agentRepository.updateProduct(productId, {
        companyname,
        weight,
        price,
        quantity,
      });

      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }
}
