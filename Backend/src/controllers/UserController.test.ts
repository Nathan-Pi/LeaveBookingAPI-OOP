import { UserController } from "./UserController";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";
import { StatusCodes } from "http-status-codes";

describe("UserController", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAll", () => {

    it("should return 204 if no users found", async () => {
      // Arrange
      const userController = new UserController();
      const req = {} as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "find").mockResolvedValue([]);
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getAll(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it("should return 500 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = {} as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "find").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getAll(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("getByEmail", () => {   

    it("should return 400 if email param is missing or blank", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { emailAddress: "" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getByEmail(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it("should return 400 if user with email does not exist", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { emailAddress: "notfound@email.com" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOne").mockResolvedValue(null);
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getByEmail(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it("should return 400 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { emailAddress: "a@email.com" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOne").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getByEmail(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("getById", () => {

    it("should return 400 if ID param is not a number", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { id: "abc" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it("should return 204 if user with ID does not exist", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { id: "2" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOne").mockResolvedValue(null);
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it("should return 400 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { id: "1" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOne").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.getById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("create", () => {

    it("should return 400 if validation fails", async () => {
      // Arrange
      const userController = new UserController();
      const req = { body: { firstname: "", surname: "", password: "", email: "", roleId: 1, managerId: 2 } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(require("class-validator"), "validate").mockResolvedValue([{ constraints: { isNotEmpty: "Should not be empty" } }]);
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });

    it("should return 400 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = { body: { firstname: "A", surname: "B", password: "pass", email: "a@email.com", roleId: 1, managerId: 2 } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(require("class-validator"), "validate").mockResolvedValue([]);
      jest.spyOn(userController["userRepository"], "save").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.create(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("delete", () => {

    it("should return 404 if no ID provided", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { id: undefined } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.delete(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });


    it("should return 404 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = { params: { id: "1" } } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "delete").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.delete(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });

  describe("updateRole", () => {

    it("should return 400 if signed-in user is not admin", async () => {
      // Arrange
      const userController = new UserController();
      const req = {
        signedInUser: { role: { id: 2 } },
        params: { id: 1 },
        body: { roleId: 2 }
      } as any as Request;
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          send: jest.fn()
        } as any as Response;
      // Act
      await userController.updateRole(req, res);

      // Assert
            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      
 });

    it("should return 404 if user with ID does not exist", async () => {
      // Arrange
      const userController = new UserController();
      const req = {
        signedInUser: { role: { id: 1 } },
        params: { id: 1 },
        body: { roleId: 2 }
      } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOneBy").mockResolvedValue(null);

      // Act
      await userController.updateRole(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("User not found") }));
    });


    it("should return 400 if there is a database error", async () => {
      // Arrange
      const userController = new UserController();
      const req = {
        signedInUser: { role: { id: 1 } },
        params: { id: 1 },
        body: { roleId: 2 }
      } as any as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any as Response;
      jest.spyOn(userController["userRepository"], "findOneBy").mockRejectedValue(new Error("DB error"));
      jest.spyOn(require("../helper/ResponseHandler").ResponseHandler, "sendErrorResponse")
        .mockImplementation((res: any, status: number, message?: string) => res.status(status).json({ error: message }));

      // Act
      await userController.updateRole(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
  });
});