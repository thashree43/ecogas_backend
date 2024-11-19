import { Types } from "mongoose";
import { userModel } from "../infrastructure/database";
import { IUserRepository } from "../domain";

export class sendmessageusecase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    content: string,
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    image?: string | null
  ) {
    const receiverData = await userModel.findOne({ is_admin: true });
    if (!receiverData) {
      throw new Error("Admin user not found");
    }

    const newMessageData = {
      reciever: receiverData._id,
      sender: userId,
      content: content,
      chat: chatId,
      image: image || null
    };

    const savedMessage = await this.userRepository.saveMessage(newMessageData);
    await this.userRepository.updateLatestMessage(chatId, savedMessage._id);
    return savedMessage;
  }
}