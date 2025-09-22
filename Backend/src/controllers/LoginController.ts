import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PasswordHandler } from "../helper/PasswordHandler";
import { UserDTOToken } from "./UserDTOToken";
import jwt from "jsonwebtoken";

export class LoginController {
  public static readonly ERROR_NO_EMAIL_PROVIDED = "No email provided";
  public static readonly ERROR_NO_PASSWORD_PROVIDED = "No password provided";
  public static readonly ERROR_USER_NOT_FOUND = "User not found";
  public static readonly ERROR_PASSWORD_INCORRECT = "Password incorrect";

  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      let email = req.body.email;

      if (!email || email.trim().length === 0) {
        throw new Error(LoginController.ERROR_NO_EMAIL_PROVIDED);
      }

      let password = req.body.password;

      if (!password || password.trim().length === 0) {
        throw new Error(LoginController.ERROR_NO_PASSWORD_PROVIDED);
      }

      const user = await this.userRepository
        .createQueryBuilder("user")
        .addSelect(["user.password", "user.salt"]) //add hidden fields
        .leftJoinAndSelect("user.role", "role") //Join role
        .where("user.email = :email", { email: email })
        .getOne();

      if (!user) {
        throw new Error(LoginController.ERROR_USER_NOT_FOUND);
      }

      if (!PasswordHandler.verifyPassword(password, user.password, user.salt)) {
        throw new Error(LoginController.ERROR_PASSWORD_INCORRECT);
      }

      let token = new UserDTOToken(user.email, user.role);
      res
        .status(StatusCodes.ACCEPTED)
        .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })

        .json({ token: jwt.sign({ token }, process.env.JWT_SECRET, { expiresIn: "3h" }), user });    } catch (error: any) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        error.message
      );
    }
  };

  public validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(StatusCodes.OK).json({ valid: true, role: token.role });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ valid: false, message: error.message });
  }
};
}

