import { AgentProduct } from '../domain'; 
import { IProductDocument } from '../infrastructure/database'; 
import {AgentRepository} from "../infrastructure/repository"
export class ProductAddingUsecase {  
  constructor(private agentRepository: AgentRepository) {}  

  async addProduct(agentId: string, productData: {    
    companyname: string;    
    weight: number;    
    price: number;    
    quantity: number;  
  }): Promise<IProductDocument | null> {    
    console.log("the agentId be this ", agentId);    

    if (!this.isValidObjectId(agentId)) {      
      throw new Error('Invalid agentId');    
    }  

    const newProduct = new AgentProduct(productData);    
    const addedProductData: IProductDocument | null = await this.agentRepository.addproduct(newProduct, agentId);    
    return addedProductData;  
  }  

  private isValidObjectId(id: string): boolean {    
    return /^[0-9a-fA-F]{24}$/.test(id);  
  }  
}
