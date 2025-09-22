import request from "supertest";
import express, { Router } from "express";
import { RoleRouter } from "./RoleRouter";
import { RoleController } from "../controllers/RoleController";
import { StatusCodes } from "http-status-codes";

const mockRoleController = {
  getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
} as unknown as RoleController;

const router = Router();
jest.spyOn(router, "get");


const app = express();
const helmet = require("helmet");
app.use(helmet());
app.use(express.json());

const roleRouter = new RoleRouter(router, mockRoleController);
app.use("/roles", roleRouter.getRouter());

const BASE_ROLES_URL = "/roles";


describe("RoleRouter tests", () => {
  it("getAll on GET /roles can be called", async () => {
    // Act
    const response = await request(app)
      .get(BASE_ROLES_URL)
      .expect(StatusCodes.OK);

    // Assert
    expect(mockRoleController.getAll).toHaveBeenCalled();
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual([]);
  });
});