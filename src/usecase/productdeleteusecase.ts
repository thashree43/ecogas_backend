import { Types } from 'mongoose';
import { AgentRepository } from './../infrastructure/repository';

export class DeleteProductUseCase {
  constructor(private agentRepository: AgentRepository) {}

  async execute(id: string | Types.ObjectId): Promise<void> {
    try {
      const result = await this.agentRepository.deleteproduct(id);
      if (!result) {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error("Error occurred while deleting the product:", error);
      throw new Error("Server error");
    }
  }
}
