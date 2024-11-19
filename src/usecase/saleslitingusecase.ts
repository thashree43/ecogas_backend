import { log } from "winston";
import { AdminRepository } from "../infrastructure/repository";

export class saleslitingusecase{
    constructor(
        private adminRepository:AdminRepository
    ){}
    async execute():Promise<any>{
const datas = await this.adminRepository.getsales()
console.log("the sales reached here",datas);

return datas
    }
}