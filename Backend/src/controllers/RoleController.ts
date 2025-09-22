import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { Role } from "../entity/Role";
import { UserController } from "./UserController";
import { UserHelper } from "../helper/UserHelper";
import { BaseController } from "./BaseController";

export class RoleController extends BaseController {

  private roleRepository: Repository<Role>;

  constructor() {
    super();
    this.roleRepository = AppDataSource.getRepository(Role);
  }

 
  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {

      UserHelper.requireAdmin(req);
      const roles = await this.roleRepository.find();
      if (roles.length === 0) {
        ResponseHandler.sendErrorResponse(res, StatusCodes.NO_CONTENT);
        return;
      }
      ResponseHandler.sendSuccessResponse(res, roles);

    } catch (error: any) {
      this.handleError(res, error);
    }
  };

}