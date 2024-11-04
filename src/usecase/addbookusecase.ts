import mongoose from "mongoose";
import { bookModel, IBookData } from "../infrastructure/database";
import { IUserRepository } from "../domain"
import { BookData } from "../domain";

export class addbookusecase {
  constructor(private userRepository: IUserRepository) {}

  isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async execute(
    userId: string,
    name: string,
    consumerId: number,
    mobile: number,
    address: string,
    company: string,
    gender: string
  ): Promise<IBookData> {
    if (!this.isValidObjectId(userId)) {
      throw new Error("Invalid userId");
    }

    const existingBook = await bookModel.findOne({ mobile: mobile });
    if (existingBook) {
      
      const error = new Error("The book already exists");
      (error as any).statusCode = 409;
      throw error;  
    }

    const bookData = new BookData({
      name,
      consumerid: consumerId,
      mobile,
      address,
      company,
      gender,
    });

    const bookdatas = await this.userRepository.savebook(bookData);
    await this.userRepository.linkbooktouser(userId, bookdatas._id);
    return bookdatas;
  }
}
