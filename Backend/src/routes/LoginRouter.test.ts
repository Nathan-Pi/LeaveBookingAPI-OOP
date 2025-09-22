import request from "supertest";
import express, { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { LoginRouter } from "./LoginRouter";

// Mock LoginController with login method
const mockLoginController = {
  login: jest.fn((req, res) =>
    res.status(StatusCodes.OK).json({ message: "Logged in", user: req.body.email })
  ),
};

const router = Router();
const app = express();
app.use(express.json());

const loginRouter = new LoginRouter(router, mockLoginController as any);
app.use("/login", loginRouter.getRouter());

describe("LoginRouter tests", () => {
  it("login on POST /login can be called and logs a user in", async () => {
    // Arrange
    const loginPayload = { email: "test@email.com", password: "password123" };

    // Act
    const response = await request(app)
      .post("/login")
      .send(loginPayload)
      .expect(StatusCodes.OK);

    // Assert
    expect(mockLoginController.login).toHaveBeenCalled();
    expect(response.body).toEqual({ message: "Logged in", user: loginPayload.email });
  });
});