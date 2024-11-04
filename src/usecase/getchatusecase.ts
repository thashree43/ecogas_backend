import { Types } from "mongoose";
import { chat, IUserRepository } from "../domain";

export class getmmessageusecase{
    constructor(
        private UserRepository:IUserRepository
    ){}
async execute(chatid:Types.ObjectId | string){
    try {
        console.log("daaaa");
        
        const res = await this.UserRepository.getmessages(chatid)
        return res
        
    } catch (error) {
        console.error(error);
        
    }
}


}