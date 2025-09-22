import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseHandler } from "../helper/ResponseHandler";

export class BaseController {
  protected handleError(res: Response, error: any, status = StatusCodes.BAD_REQUEST) {
    ResponseHandler.sendErrorResponse(res, status, error.message || "An error occurred");
  }
}