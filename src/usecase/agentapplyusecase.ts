import { AgentRepository } from "../infrastructure/repository";
import { Agent, IagentData } from "../domain";
import { hashPassword } from "../infrastructure/utilis";

export class Agentapplyusecase {
  constructor(private agentRepository: AgentRepository) {}

  async applyAgent(agentData: {
    agentname: string;
    email: string;
    mobile: string;
    password: string;
    pincode: string;
    image: string;
  }): Promise<Agent> {
    const hashedPassword = await hashPassword(agentData.password);
    const newAgent = new Agent({
      agentname: agentData.agentname,
      email: agentData.email,
      mobile: parseInt(agentData.mobile),
      password: hashedPassword,
      pincode: parseInt(agentData.pincode),
      image: agentData.image,
    });

    const savedAgent = await this.agentRepository.saveagent(newAgent);
    return new Agent(savedAgent as IagentData);
  }
}