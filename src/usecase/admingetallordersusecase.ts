import {IadminRepository} from "../domain"


export class admingetallorderusecasse{
    constructor(
        private AdminRepositories:IadminRepository
    ){}

    async execute():Promise<any>{
        const data = await this.AdminRepositories.allorders()
        if(!data){
            throw new Error("no orders")
        }
        return data
    }
}