import { Role } from "./Role";
import { validate } from "class-validator";

describe("Role Entity", () => {
  it("should be invalid if name is blank", async () => {
    // Arrange
    const role = new Role();
    role.name = "";

    // Act
    const errors = await validate(role);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].constraints?.isNotEmpty).toBeDefined();  });
});

it("should be invalid if name contains only spaces", async () => {
  // Arrange
  const role = new Role();
  role.name = "     ";

  // Act
  const errors = await validate(role);

  // Assert
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].constraints?.matches).toBeDefined();  
});

it("should be invalid if name is longer than 30 characters", async () => {
  // Arrange
  const role = new Role();
  role.name = "a".repeat(31);

  // Act
  const errors = await validate(role);

  // Assert
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].constraints?.maxLength).toBeDefined();
});

it("should be valid if name is a non-empty, trimmed string up to 30 characters", async () => {
  // Arrange
  const role = new Role();
  role.name = "Nathan";

  // Act
  const errors = await validate(role);

  // Assert
  expect(errors.length).toBe(0);
});