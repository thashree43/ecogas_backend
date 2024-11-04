import { IadminRepository } from "../domain";

export class admindashboardusecase {
  constructor(private AdminRepository: IadminRepository) {}

  async execute(): Promise<any> {
    try {
      const totalOrdersCount = await this.AdminRepository.getTotalOrdersCount();
      const { totalOrdersAmount, totalProfit } = await this.AdminRepository.getTotalOrdersAndProfit();
      const totalAgentCount = await this.AdminRepository.getTotalAgentCount();
      const monthlySales = await this.AdminRepository.getMonthlySales();

      return {
        totalOrdersCount,
        totalOrdersAmount,
        totalProfit,
        totalAgentCount,
        monthlySales,
      };
    } catch (error) {
      console.error("Failed to retrieve dashboard data:", error);
      throw new Error("Failed to retrieve dashboard data");
    }
  }
}
