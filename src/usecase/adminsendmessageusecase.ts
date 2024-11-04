import { IadminRepository } from "../domain";
import { IMessageData } from "../domain/entities/messageentities";
import { ChatModel } from "../infrastructure/database";

export class AdminSendMessageUseCase {
  constructor(private adminRepository: IadminRepository) {}

  async execute(chatId: string, adminId: string, content: string, image?: string | null): Promise<IMessageData> {
    try {
      const receiverData = await ChatModel.findOne({ _id: chatId });
      
      if (!receiverData || !receiverData.user[0]) {
        throw new Error('Chat or user not found');
      }

      // Convert the ID to string and then create the message data
      const receiverId = receiverData.user[0].toString();

      const newMessageData = {
        reciever: [receiverId],  // Note: using "reciever" to match your schema
        sender: [adminId],
        content: content,
        chat: [chatId],
        image: image
      };

      const savedMessage = await this.adminRepository.saveMessage(newMessageData);
      await this.adminRepository.updateLatestMessage(chatId, savedMessage._id);
      return savedMessage;
    } catch (error) {
      console.error('Error in AdminSendMessageUseCase:', error);
      throw error;
    }
  }
}