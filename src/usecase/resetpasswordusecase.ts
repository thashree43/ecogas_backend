import { IRedisRepository, IUserRepository } from "../domain";
import { hashPassword } from "../infrastructure/utilis";

export class Resetpasswordusecase {
  constructor(
    private userRepository: IUserRepository,
    private redisRepository: IRedisRepository
  ) {}

  async execute(token: string, newpassword: string): Promise<{}> {
    if (!token || !newpassword) {
      throw new Error("Invalid input: Token and new password are required");
    }

    try {
      console.log(`Attempting to reset password with token: ${token}`);
      
      const email = await this.redisRepository.get(token);

      if (!email) {
        console.error(`Invalid or expired token: ${token}`);
        throw new Error("Invalid token");
      }

      console.log(`Retrieved email from token: ${email}`);

      // Hash the new password
      const hashedPassword = await hashPassword(newpassword);
      console.log(`Hashed new password for email: ${email}`);

      // Update the user password in the database
      await this.userRepository.updatePassword(email, hashedPassword);
      console.log(`Updated password in user repository for email: ${email}`);

      // Delete the token from Redis
      await this.redisRepository.delete(token);
      console.log(`Deleted token from Redis: ${token}`);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
