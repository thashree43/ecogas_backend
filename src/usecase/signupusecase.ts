import { IUserRepository, IRedisRepository } from "../domain";
import { User } from "../domain";
import { hashPassword } from "../infrastructure/utilis"; 
import { Otpservice } from "../infrastructure/service/Otpservice";

type SignupResponse = User | { message: string }; 

export class signupusecase {
    
    constructor(
        private userRepository: IUserRepository,
        private otpService: Otpservice,
        private redisRepository: IRedisRepository
    ) {}

    async execute(username: string, email: string, mobile: number, password: string): Promise<SignupResponse> {
        console.log("it may have reached to signupusecase");
        
        if (!username || !email || !mobile || !password) {
            return { message: "Invalid input" }; 
        }

        const existEmail = await this.userRepository.findbyEmail(email);
        if (existEmail) {
            return { message: "The email already exists" }; 
        }

        const hashedPassword = await hashPassword(password);

        const user = new User({
            username,
            email,
            mobile,
            password: hashedPassword,
            
            
        });
        console.log("the user data has reached here");
    
        const otp = this.otpService.generateotp(4);
        console.log("the otp be this ", otp);
        
        const subject = `YOUR OTP CODE ${otp}`;
        const message = `The OTP for your registration is ${otp}`;
        await this.otpService.sendMail(email, subject, message);
        await this.redisRepository.store(email, otp, 300); 

        // Convert User instance to IUserData
        const userData = user.toIUserData();
        const savedUserData = await this.userRepository.saveuser(userData as any);

        // Convert savedUserData to User instance
        const savedUser = new User(savedUserData);

        return savedUser;
    }
}
