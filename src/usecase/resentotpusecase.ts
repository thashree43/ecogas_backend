import { IRedisRepository } from "../domain";
import { Otpservice } from "../infrastructure/service/Otpservice";

export class ResentotpUseCase{
    constructor(
        private otpRepository:Otpservice,
        private redisRepository:IRedisRepository
    ){}

    async execute(email:string):Promise<void>{
        if (!email) {
            throw new Error("the email is not correct ")
        }
        const otp = this.otpRepository.generateotp(4)

        const subject = "your Otp Code";
        const message = `your otp code is ${otp}`
        await this.otpRepository.sendMail(email,subject,message)
        await this.redisRepository.store(email,otp,60);
    }
}