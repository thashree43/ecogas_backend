import { Otpservice } from "../infrastructure/service/Otpservice";
import { IRedisRepository, IUserRepository } from "../domain";
import { generatetoken } from "../interface/middleware/authtoken";
require('dotenv').config(); 

export class RequestpasswordUsecase {
    constructor(
        private userRepository: IUserRepository,
        private redisRepository: IRedisRepository,
        private otpService: Otpservice
    ) {}

    async execute(email: string): Promise<{ success: boolean }> {
        console.log("Email received in the use case:", email);
        
        if (!email) {
            throw new Error("The email is not correct");
        }

        const user = await this.userRepository.findbyEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        console.log("Processing password reset for user...");

        const token = generatetoken({ id: user._id.toString(), email }); 

        console.log("Generated reset token:", token);

       const th= await this.redisRepository.store(token, email, 3600);

        const resetlink = `${process.env.CLIENT_URL}/updatepassword/${token}`;
        
        await this.otpService.sendMail(email, "Password Reset", `Reset your password using this link: ${resetlink}`);

        return { success: true };
    }
}
