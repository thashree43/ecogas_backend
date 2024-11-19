import { IUserRepository } from "../domain";
import { IUserData } from "../infrastructure/database";
import { User } from "../domain";
import { getUserFromGoogle } from "../infrastructure/utilis";
import { generatetoken ,generateRefreshToken} from "../interface/middleware/authtoken";

export class GoogleAuthUseCase {
  constructor(private googlrepository: IUserRepository) {}

  async execute(token: string): Promise<{ success: boolean; token: string; refreshToken: string; user?: User }> {
    if (!token) {
      throw new Error("The token is required.");
    }

    try {
      console.log("Starting Google authentication with token:", token);

      const { name, email, id } = await getUserFromGoogle(token);
      console.log("Retrieved user info from Google:", { name, email, id });

      let userData: IUserData | null = await this.googlrepository.findbyEmail(email);
      let user: User;

      if (!userData) {
        console.log("User not found in the repository. Creating new user...");

        user = new User({
          username: name,
          email: email,
          mobile: null,
          password: id, 
          is_blocked: false,
          is_admin: false,
          is_verified: true
        });

        userData = await this.googlrepository.saveuser(user);
        console.log("New user saved in the repository:", userData);
      } else {
        console.log("User found in the repository:", userData);
        user = new User(userData);
      }

      if (user.is_blocked) {
        console.error("User is blocked.");
        throw new Error("User is blocked.");
      }

      const tokenPayload = { id: user._id.toString(), email }; 
      const newToken = generatetoken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload); 
      console.log("Generated tokens:", { newToken, refreshToken, user });

      return { success: true, token: newToken, refreshToken, user };
    } catch (error) {
      console.error("Error in Google authentication use case:", error);
      throw error;
    }
  }
}
