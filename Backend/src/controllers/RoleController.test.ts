import { RoleController } from "./RoleController";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

describe("RoleController - getAll", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 401 if user is not admin when getting all roles", async () => {
    // Arrange
    const roleController = new RoleController();
    const req = {
      signedInUser: { role: { id: 3 }, email: "user@email.com" }, // Not admin (admin id is 1)
    } as any as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    } as any as Response;

    jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
      .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

    // Act
    await roleController.getAll(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("You are not authorized")
      })
    );
  });
});

