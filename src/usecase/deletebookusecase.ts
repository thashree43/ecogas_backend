import { Types } from "mongoose";
import { IUserData } from "../domain";
import {IUserRepository} from "../domain"

export class deletebookusecase{
    constructor(private UserRepositories:IUserRepository){}

    async execute(bookId:string | Types.ObjectId):Promise<void>{
        try {
           const resdata =  await this.UserRepositories.deletebookbyid(bookId)
           if (!resdata) {
            throw new Error("book data has not found ")
           }
        } catch (error) {
            console.error("the erros seems here");
            
        }
    }
}