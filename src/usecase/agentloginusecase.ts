import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AgentRepository } from "../infrastructure/repository";
import { generateRefreshToken, generatetoken } from "../interface/middleware/authtoken";

export class agentloginusecase {
  constructor(private agentRepository: AgentRepository) {}

  async execute(email: string, password: string) {

    try {
      const agent = await this.agentRepository.findemail(email);

      if (!agent) {
        return { success: false, message: "Agent not found" };
      }

      

      const isPasswordValid = await bcrypt.compare(password, agent.password);

      if (!isPasswordValid) {
        console.log("Invalid password");
        return { success: false, message: "Invalid credentials" };
      }

      if (!agent.is_Approved) {
        return { success: false, message: "Agent is not approved" };
      }

      const token = generatetoken({id:agent._id.toString(),email:agent.email})
      const agentrefreshToken = generateRefreshToken({id:agent._id.toString(),email:agent.email})

      return { success: true, agent, token ,agentrefreshToken};
    } catch (error) {
      console.error("Error during login:", error);
      return { success: false, message: "An error occurred during login" };
    }
  }
}
