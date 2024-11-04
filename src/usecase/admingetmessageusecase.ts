import { IadminRepository } from "../domain";
import { IMessageData } from "../domain/entities/messageentities";

export class GetMessagesUseCase {
  private adminRepository: IadminRepository;

  constructor(adminRepository: IadminRepository) {
    this.adminRepository = adminRepository;
  }

  async execute(chatId: string): Promise<IMessageData[]> {
    return this.adminRepository.getMessages(chatId);
  }
}