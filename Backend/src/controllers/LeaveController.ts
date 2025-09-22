import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LeaveRequest } from "../entity/LeaveRequest";
import { In, Repository } from "typeorm";
import { ResponseHandler } from "../helper/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { User } from "../entity/User";
import { LeaveHelper } from "../helper/LeaveHelper";
import { UserHelper } from "../helper/UserHelper";
import { BaseController } from "./BaseController";

function calculateNumberOfDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export class LeaveController extends BaseController {
  private leaveRepository: Repository<LeaveRequest>;

  constructor() {
    super();
    this.leaveRepository = AppDataSource.getRepository(LeaveRequest);
  }

  public requestLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, reason } = req.body;

      LeaveHelper.validateDates(startDate, endDate);

      const dbUser = await UserHelper.getDbUserFromRequest(req);
      const leaveRequest = new LeaveRequest();
      leaveRequest.startDate = new Date(startDate);
      leaveRequest.endDate = new Date(endDate);
      leaveRequest.reason = reason || "";
      leaveRequest.user = dbUser;

      const savedLeaveRequest = await this.leaveRepository.save(leaveRequest);

      ResponseHandler.sendSuccessResponse(
        res,
        savedLeaveRequest,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public approveLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbUser = await UserHelper.getDbUserFromRequest(req);
    UserHelper.requireManagerOrAdmin(req);

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Invalid leave request ID" });
    }

    const leaveRequest = await this.leaveRepository.findOne({
      where: { leaveId: id },
      relations: ["user"],
    });

    if (!leaveRequest) {
      return res.status(400).json({ error: "Invalid leave request " });
    }
    //WORKAROUND - get an array of all the users under the manager currently signed in to check against
    const users = await AppDataSource.getRepository(User).find({
      where: { manager: { id: dbUser.id } },
    });
    //WORKAROUND - check to see if the leave request owner is in the array of users
    const isUserUnderManager = users.some(
      (user) => user.id === leaveRequest.user.id
    ); 
    //WORKAROUND - if the leave request owner is not in the array of users or if the signed in user is not an admin
    if (!isUserUnderManager && req.signedInUser.role.id !== 1) {
      return res
        .status(403)
        .json({
          error: "You are not authorized to approve this leave request.",
        });
    }

    leaveRequest.status = "approved";

    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const diffDays = calculateNumberOfDays(start, end);

    if (leaveRequest.user.remainingAl < diffDays) {
      return res
        .status(400)
        .json({ error: "Not enough annual leave balance." });
    }

    leaveRequest.user.remainingAl -= diffDays;
    await AppDataSource.getRepository(User).save(leaveRequest.user); // <-- Save the user balance!

    const updatedLeaveRequest = await this.leaveRepository.save(leaveRequest);

    return res.status(200).json({
      message: `Leave request ${id} has been approved`,
      data: {
        reason: "OK to approve",
      },
    });
  } catch (error: any) {
    this.handleError(res, error);
  }
};
  public rejectLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      UserHelper.requireManagerOrAdmin(req);

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Invalid leave request ID" });
      }

      const leaveRequest = await this.leaveRepository.findOne({
        where: { leaveId: id },
        relations: ["user"],
      });

      if (!leaveRequest) {
        return res.status(400).json({ error: "Invalid leave request " });
      }

      leaveRequest.status = "rejected";

      const updatedLeaveRequest = await this.leaveRepository.save(leaveRequest);

      return res.status(200).json({
        message: `Leave request ${id} has been rejected`,
        data: {
          reason: "rejected",
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public getAllLeaveRequests = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const dbUser = await UserHelper.getDbUserFromRequest(req);

      if (req.signedInUser.role.id === 1) {
        const leaveRequests = await this.leaveRepository.find({
          relations: ["user"],
        });

        if (!leaveRequests) {
          return res.status(404).json({ error: "No leave requests found." });
        }

        return res.status(200).json({
          message: "Leave requests retrieved successfully.",
          data: leaveRequests,
        });
      } else if (req.signedInUser.role.id === 2) {
        const leaveRequests = await this.leaveRepository.find({
          relations: ["user"],
          where: {
            user: {
              manager: {
                id: dbUser.id,
              },
            },
          },
        });
        if (!leaveRequests) {
          return res.status(404).json({ error: "No leave requests found." });
        }
        return res.status(200).json({
          message: "Leave requests retrieved successfully.",
          data: leaveRequests,
        });
      } else if (req.signedInUser.role.id === 3) {
        const leaveRequests = await this.leaveRepository.find({
          relations: ["user"],
          where: {
            user: {
              id: dbUser.id,
            },
          },
        });

        if (!leaveRequests) {
          return res.status(404).json({ error: "No leave requests found." });
        }
        return res.status(200).json({
          message: "Leave requests retrieved successfully.",
          data: leaveRequests,
        });
      }
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public cancelLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Invalid leave request ID" });
      }

      const leaveRequest = await this.leaveRepository.findOne({
        where: { leaveId: id },
        relations: ["user", "user.manager"], // <-- add this
      });

      if (!leaveRequest) {
        return res.status(400).json({ error: "Invalid leave request " });
      }

      const dbUser = await UserHelper.getDbUserFromRequest(req);

      if (
        leaveRequest.user.id !== dbUser.id &&
        req.signedInUser.role.id !== 1 &&
        req.signedInUser.role.id !== leaveRequest.user.manager.id
      ) {
        // CLARIFY not the user who made the request or admin or the manager of the request owner
        return res
          .status(403)
          .json({
            error: "You are not authorized to cancel this leave request.",
          });
      }

      leaveRequest.status = "cancelled";

      const updatedLeaveRequest = await this.leaveRepository.save(leaveRequest);
      return res.status(200).json({
        message: `Leave request ${id} has been cancelled`,
        data: {
          reason: "cancelled",
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public amendLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.signedInUser.role.id !== 1) {
        return res
          .status(403)
          .json({ error: "You are not authorized to amend leave amounts." });
      }
      const { amount } = req.body;
      const { id } = req.params;
      if (!id || !amount) {
        return res
          .status(400)
          .json({ error: "Invalid leave request ID or amount" });
      }
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id },
      });
      if (!user) {
        return res.status(400).json({ error: "Invalid user" });
      }

      user.remainingAl = amount;
      const updatedUser = await AppDataSource.getRepository(User).save(user);

      return res.status(200).json({
        message: `User ${id} AL balance has been amended to ${amount} days`,
        data: {
          reason: "OK to amend",
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public outstandingLeavebyStaffID = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (req.signedInUser.role.id !== 1) {
        return res
          .status(403)
          .json({
            error: "You are not authorized to view outstanding leave requests.",
          });
      }
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await AppDataSource.getRepository(User).findOne({
        where: { id },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid user" });
      }

      const leaveRequests = await this.leaveRepository.find({
        where: { user: { id }, status: "Pending" },
        relations: ["user"],
      });
      if (leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found." });
      }
      return res.status(200).json({
        message: "Leave requests retrieved successfully.",
        data: leaveRequests,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public outstandingLeavebyManager = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (![1, 2].includes(req.signedInUser.role.id)) {
        return res
          .status(403)
          .json({
            error: "You are not authorized to view outstanding leave requests.",
          });
      }
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await AppDataSource.getRepository(User).findOne({
        where: { id },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid user" });
      }

      const users = await AppDataSource.getRepository(User).find({
        where: { manager: { id } },
      });
      if (!users) {
        return res.status(404).json({ error: "No users found." });
      }

      const leaveRequests = await this.leaveRepository.find({
        where: { user: In(users.map((user) => user.id)), status: "Pending" },
        relations: ["user"],
      });

      if (leaveRequests.length === 0) {
        return res.status(404).json({ error: "No leave requests found." });
      }
      return res.status(200).json({
        message: "Leave requests retrieved successfully.",
        data: leaveRequests,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public outstandingLeave = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (req.signedInUser.role.id !== 1) {
        return res
          .status(403)
          .json({
            error: "You are not authorized to view outstanding leave requests.",
          });
      }

      const leaveRequests = await this.leaveRepository.find({
        where: { status: "Pending" },
        relations: ["user"],
      });
      if (leaveRequests.length === 0) {
        return res
          .status(404)
          .json({ error: "No pending leave requests found." });
      }
      return res.status(200).json({
        message: "Leave requests retrieved successfully.",
        data: leaveRequests,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
  public getOwnLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const dbUser = await UserHelper.getDbUserFromRequest(req);

      const leaveRequests = await this.leaveRepository.find({
        relations: ["user"],
        where: {
          user: {
            id: dbUser.id,
          },
        },
      });

      if (!leaveRequests) {
        return res.status(404).json({ error: "No leave requests found." });
      }
      return res.status(200).json({
        message: "Leave requests retrieved successfully.",
        data: leaveRequests,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  public getOwnLeaveBalance = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const dbUser = await UserHelper.getDbUserFromRequest(req);

      if (!dbUser) {
        return res.status(404).json({ error: "User not found." });
      }

      // Only return the remainingAl field
      return res.status(200).json({
        remainingAl: dbUser.remainingAl,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };
}
