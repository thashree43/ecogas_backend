import { IUserData } from "../domain";
import { IRedisRepository, IUserRepository } from "../domain";
import { generatetoken } from "../interface/middleware/authtoken";

export class VerifyOtpUseCase {
  constructor(
    private verifyOtpRepository: IRedisRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(otp: string, email: string): Promise<{ success: boolean, token?: string, refreshToken?: string, user: IUserData }> {
    if (!otp || !email) {
      throw new Error("OTP and email are required.");
    }

    console.log(`Verifying OTP for email: ${email}`);

    const userOtp = await this.verifyOtpRepository.get(email);
    console.log(`User OTP from Redis: ${userOtp}`);

    if (userOtp === null) {
      console.error(`OTP not found in Redis for email: ${email}`);
      throw new Error("OTP not found in Redis.");
    }

    if (userOtp !== otp) {
      throw new Error("Invalid OTP.");
    }

    await this.verifyOtpRepository.delete(email);

    const user = await this.userRepository.findbyEmail(email);
    if (!user) {
      throw new Error("User not found.");
    }

    user.is_verified = true;
    await user.save();

    const tokenPayload = { id: user._id.toString(), email }; 
    const token = generatetoken(tokenPayload);
    const refreshToken = generatetoken(tokenPayload); 

    return { 
      success: true, 
      token, 
      refreshToken, 
      user 
    };
  }
}
