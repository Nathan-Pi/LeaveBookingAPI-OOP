import { ResponseHandler } from "./ResponseHandler";
import { StatusCodes } from "http-status-codes";

describe("ResponseHandler", () => {
  it("should send an error response with correct structure", () => {
    // Arrange
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any;
    const message = "Something went wrong";

    // Act
    ResponseHandler.sendErrorResponse(res, StatusCodes.BAD_REQUEST, message);

    // Assert
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message,
          status: StatusCodes.BAD_REQUEST,
          timestamp: expect.any(String)
        })
      })
    );
  });

  it("should send a success response with correct structure", () => {
    // Arrange
    const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
    } as any;
    const data = { message: "success" };

    // Act
    ResponseHandler.sendSuccessResponse(res, data, StatusCodes.OK);

    // Assert
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data
      })
    );
  });
});