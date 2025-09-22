import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Admin, Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { validate } from "class-validator";
import { instanceToPlain } from "class-transformer";
import { Role } from "../entity/Role";
import { UserHelper } from "../helper/UserHelper";
import { BaseController } from "./BaseController";

export class UserController extends BaseController {
  public static readonly ERROR_NO_USER_ID_PROVIDED = "No ID provided";
  public static readonly ERROR_INVALID_USER_ID_FORMAT = "Invalid ID format";
  public static readonly ERROR_USER_NOT_FOUND = "User not found";
  public static readonly ERROR_USER_NOT_FOUND_WITH_ID = (id: number) =>
    `User not found with ID: ${id}`;
  public static readonly ERROR_PASSWORD_IS_BLANK = "Password is blank";
  public static readonly ERROR_FAILED_TO_RETRIEVE_USERS =
    "Failed to retrieve users";
  public static readonly ERROR_FAILED_TO_RETRIEVE_USER =
    "Failed to retrieve user";
  public static readonly ERROR_USER_NOT_FOUND_FOR_DELETION =
    "User with the provided ID not found";
  public static readonly ERROR_EMAIL_REQUIRED = "Email is required";
  public static readonly ERROR_EMAIL_NOT_FOUND = (email: string) =>
    `${email} not found`;
  public static readonly ERROR_RETRIEVING_USER = (error: string) =>
    `Error retrieving user: ${error}`;
  public static readonly ERROR_UNABLE_TO_FIND_USER_EMAIL = (email: string) =>
    `Unable to find user with the email: ${email}`;
  public static readonly ERROR_VALIDATION_FAILED = "Validation failed";
  private userRepository: Repository<User>;
  constructor() {
    super();
    this.userRepository = AppDataSource.getRepository(User);
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      UserHelper.requireAdmin(req);
      const users = await this.userRepository.find({
        relations: ["role", "manager"], // Include all  role fields in response
      });

      if (users.length === 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NO_CONTENT);
        return;
      }

      ResponseHandler.sendSuccessResponse(res, users);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  public getByEmail = async (req: Request, res: Response): Promise<void> => {
    

    try {
        UserHelper.requireAdmin(req);
    const email = req.params.emailAddress;

    if (!email || email.trim().length === 0) {
      ResponseHandler.sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        UserController.ERROR_EMAIL_REQUIRED
      );
      return;
    }
      const user = await this.userRepository.findOne({
        where: { email: email },
        relations: ["role"],
      });
      if (!user) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `${email} not found`
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public getById = async (req: Request, res: Response): Promise<void> => {
    

    try {
          UserHelper.requireAdmin(req);
    const id = parseInt(req.params.id);
        if (isNaN(id)) {
          ResponseHandler.sendErrorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            UserController.ERROR_INVALID_USER_ID_FORMAT
          );
          return;
    }
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: ["role"],
      });
      if (!user) {
        ResponseHandler.sendErrorResponse(
          res,
          StatusCodes.NO_CONTENT,
          UserController.ERROR_USER_NOT_FOUND_WITH_ID(id)
        );
        return;
      }

      ResponseHandler.sendSuccessResponse(res, user);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
        UserHelper.requireAdmin(req);

      let user = new User();
      user.firstname = req.body.firstname
      user.surname = req.body.surname
      user.password = req.body.password;
      user.email = req.body.email;
      user.role = req.body.roleId;
      user.manager = req.body.managerId;
      //CLARIFICATION Will be salted and hashed in the entity
      
      const errors = await validate(user);
      if (errors.length > 0) {
        //CLARIFICATION Create a string of all error messages
        throw new Error(
          errors.map((err) => Object.values(err.constraints || {})).join(", ")
        );
      }

      user = await this.userRepository.save(user);

      ResponseHandler.sendSuccessResponse(
        res,
        instanceToPlain(user),
        StatusCodes.CREATED
      );
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
        UserHelper.requireAdmin(req);

      if (!id) {
        throw new Error("No ID provided");
      }
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new Error("User with the provided ID not found");
      }
      ResponseHandler.sendSuccessResponse(res, "User deleted", StatusCodes.OK);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  public updateRole = async (req: Request, res: Response): Promise<void> => {
    try {

        UserHelper.requireAdmin(req);

        const userId = req.params.id;
        const user = await this.userRepository.findOneBy({ id: userId });
        

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const roleId = req.body.roleId;
        const role = await AppDataSource.getRepository(Role).findOneBy({ id: roleId });
        if (!role) {
            return res.status(404).json({ error: "Role not found." });
        }

        user.role = role;
        await this.userRepository.save(user);
        ResponseHandler.sendSuccessResponse(res, user, StatusCodes.OK);
        

    }
    catch (error: any) {
      this.handleError(res, error);
    }
  };
}

