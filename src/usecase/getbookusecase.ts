import { IUserRepository } from "../domain";
import { Types } from "mongoose";

export class GetBookUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const objectId = new Types.ObjectId(userId);
    const user = await this.userRepository.getbookbyid(objectId);
    return user ? user.book : null;
  }
}