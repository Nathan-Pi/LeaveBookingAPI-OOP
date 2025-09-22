import request from "supertest";
import express, { Router } from "express";
import { UserRouter } from "./UserRouter";
import { StatusCodes } from "http-status-codes";
import { UserController } from "../controllers/UserController";

// Mock UserController with getAll method
const mockUserController = {
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
  getById: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  getByEmail: jest.fn((req, res) => res.status(StatusCodes.OK).json({ email: req.params.emailAddress })),
  create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
  delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
  updateRole: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id, roleId: req.body.roleId })),
} as unknown as UserController;

const router = Router();
jest.spyOn(router, "get");
jest.spyOn(router, "post");
jest.spyOn(router, "patch");
jest.spyOn(router, "delete");
jest.spyOn(router, "use");


const app = express();
app.use(express.json());

const userRouter = new UserRouter(router, mockUserController);
app.use("/users", userRouter.getRouter());

const BASE_USERS_URL = "/users";

describe("UserRouter tests", () => {
  it("getAll on GET /users can be called", async () => {
    // Act
    const response = await request(app)
      .get(BASE_USERS_URL)
      .expect(StatusCodes.OK);

    // Assert
    expect(mockUserController.getAll).toHaveBeenCalled();
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual([]);
  });
});

it("getByEmail on GET /users/email/:email can be called", async () => {
  // Arrange
  const testEmail = "test@email.com";

  // Act
  const response = await request(app)
    .get(`${BASE_USERS_URL}/email/${testEmail}`)
    .expect(StatusCodes.OK);

  // Assert
  expect(mockUserController.getByEmail).toHaveBeenCalled();
  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body).toEqual({ email: testEmail });
});

it("getById on GET /users/:id can be called", async () => {
  // Arrange
  const testId = "123";

  // Act
  const response = await request(app)
    .get(`${BASE_USERS_URL}/${testId}`)
    .expect(StatusCodes.OK);

  // Assert
  expect(mockUserController.getById).toHaveBeenCalled();
  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body).toEqual({ id: testId });
});

it("create on POST /users can be called", async () => {
  // Arrange
  const newUser = {
    firstname: "Nathan",
    surname: "p",
    password: "verysecurepassword",
    email: "nathan@email.com",
    roleId: 2
  };

  // Act
  const response = await request(app)
    .post(BASE_USERS_URL)
    .send(newUser)
    .expect(StatusCodes.CREATED);

  // Assert
  expect(mockUserController.create).toHaveBeenCalled();
  expect(response.status).toBe(StatusCodes.CREATED);
  expect(response.body).toEqual(newUser);
});

it("delete on DELETE /users/:id can be called", async () => {
  // Arrange
  const testId = "123";

  // Act
  const response = await request(app)
    .delete(`${BASE_USERS_URL}/${testId}`)
    .expect(StatusCodes.OK);

  // Assert
  expect(mockUserController.delete).toHaveBeenCalled();
  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body).toEqual({ id: testId });
});

it("updateRole on PATCH /users/:id can be called", async () => {
  // Arrange
  const testId = "123";
  const newRoleId = 5;
  const payload = { roleId: newRoleId };

  // Act
  const response = await request(app)
    .patch(`${BASE_USERS_URL}/${testId}`)
    .send(payload)
    .expect(StatusCodes.OK);

  // Assert
  expect(mockUserController.updateRole).toHaveBeenCalled();
  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body).toEqual({ id: testId, roleId: newRoleId });
});