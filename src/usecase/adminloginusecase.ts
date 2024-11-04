import { AdminRepository } from "../infrastructure/repository";
import { verifypassword } from "../infrastructure/utilis";
import {
  generatetoken,
  generateRefreshToken,
} from "../interface/middleware/authtoken";

export class Adminloginusecase {
  constructor(private adminRepository: AdminRepository) {}

  async execute(email: string, password: string): Promise<any> {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    const admin = await this.adminRepository.findbyEmail(email);

    if (!admin) {
      return { success: false, message: "Admin doesn't exist." };
    }

    if (admin.is_admin) {
      const isPassValid = await verifypassword(password, admin.password);
      if (!isPassValid) {
        return { success: false, message: "Password is not correct." };
      }
      const token = generatetoken(
        { id: admin._id.toString(), email: admin.email },
        { expiresIn: "1h" }
      );
      const refreshToken = generateRefreshToken(
        { id: admin._id.toString(), email: admin.email },
        { expiresIn: "7d" }
      );

      return { success: true, admin, token, refreshToken };
    }

    return { success: false, message: "You are not authorized." };
  }
}
