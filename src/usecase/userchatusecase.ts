import { Types } from "mongoose";
import { IUserRepository } from "../domain";

export class usechatusecase {
    constructor(private UserRepository: IUserRepository) {}

    async execute(userId: Types.ObjectId | string): Promise<{ chatId: string, messages: any[] }> {
        try {
            const result = await this.UserRepository.userchating(userId);
            return {
                chatId: result.chatId,
                messages: result.messages
            };
        } catch (error) {
            console.error("Error in usechatusecase:", error);
            throw error;
        }
    }
}