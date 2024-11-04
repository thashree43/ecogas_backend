import { IadminRepository } from "../domain";

export class getcustomerusecase{
    constructor(
        private AdminRepository:IadminRepository
    ){}

    async execute():Promise<any>{
        try {
            return await this.AdminRepository.getcustomers()
        } catch (error) {
            console.error(error);
            
        }
    }
}