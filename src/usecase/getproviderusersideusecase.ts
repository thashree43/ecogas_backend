import { IAgentRepository } from "../domain";
import { IagentData } from "../infrastructure/database";

export class GetProviderUserSideUseCase {
    constructor(
        private agentRepository: IAgentRepository
    ) {}

    async execute(pincode: string): Promise<IagentData[]> {
        const agentData = await this.agentRepository.findByPincode(pincode);
        
        return agentData;
    
    }
}