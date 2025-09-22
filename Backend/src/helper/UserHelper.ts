import { AppDataSource } from "../data-source";
import { User } from "../entity/User";


export class UserHelper {
  static async getDbUserFromRequest(req: any): Promise<User | null> {
    const email = req.signedInUser.email;
    const userRepository = AppDataSource.getRepository(User);
    const dbUser = await userRepository.findOne({ where: { email } });
    if (!dbUser) {
        throw new Error("User not found");
    }
    return dbUser;
    }

  static requireManagerOrAdmin(req: any): void {
    const roleId = req.signedInUser.role.id;
    if (roleId !== 1 && roleId !== 2) {
      throw new Error("You are not authorized to perform this action.");
    }
  }
  static requireAdmin(req: any): void {
    const roleId = req.signedInUser.role.id;
    if (roleId !== 1 ) {
      throw new Error("You are not authorized to perform this action.");
    }
  }
}