import { IUserData } from "../domain";
import { IUserRepository } from "../domain";
import { AdminRepository } from "../infrastructure/repository";

export class updateusecase {
    constructor(private adminRepository: AdminRepository) {}

    async execute(id: string, data: object): Promise<IUserData | null> {
        const updatedUser = await this.adminRepository.updatestatus(id, data);

        if (!updatedUser) {
            throw new Error("Error updating user status or user not found.");
        }

        return updatedUser;  
    }
}
