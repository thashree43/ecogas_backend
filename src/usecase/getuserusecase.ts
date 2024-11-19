import { AdminRepository } from "../infrastructure/repository";

export class getuserusecase {
  constructor(private adminRepository: AdminRepository) {}
  async execute(): Promise<any> {
    const data = await this.adminRepository.getall();

    if (!data) {
      throw new Error("Error has been occures");
    }
    return data;
  }
}
