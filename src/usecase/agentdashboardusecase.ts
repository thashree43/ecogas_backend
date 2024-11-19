import { Types } from "mongoose";
import { IAgentRepository } from "../domain";
import { IagentData } from "../infrastructure/database";
import { IDashboardData } from "../infrastructure/types/interfaces";

export class agentdashboardusecase{
    constructor(
        private AgentRepository:IAgentRepository
    ){}
    async execute(agentId: string | Types.ObjectId): Promise<IDashboardData | null> {
        try {
          const dashboardData = await this.AgentRepository.agentdashboard(agentId);
          return dashboardData;
        } catch (error) {
          console.error(error);
          console.log("error in the agentdashboardusecase");
          throw error; 
        }
      }
    }
