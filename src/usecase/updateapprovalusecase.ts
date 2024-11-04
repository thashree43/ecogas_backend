import {IagentData} from "../domain"
import {IadminRepository} from "../domain"

export class updateapprovalusecase {
    constructor(private IAdminRepository:IadminRepository){}

    async execute(id:string,data:object):Promise<IagentData | null>{
        const updatapproval = await this.IAdminRepository.updateApproval(id,data)
        if (!updatapproval) {
            throw new Error(" the datas are not found")
        }
        return updatapproval
    }
}