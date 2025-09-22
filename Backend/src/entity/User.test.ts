import { User } from "./User";
import { Role } from "./Role";
import { validate } from "class-validator";

describe("User Entity", () => {
  it("should be invalid if firstname is not a string", async () => {
    // Arrange
    const user = new User();
    user.firstname = 123 as any; // Not a string
    user.surname = "p";
    user.password = "verysecurepassword";
    user.email = "test@email.com";
    user.role = new Role();

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "firstname")).toBe(true);
  });
});
  it("should be invalid if surname is not a string", async () => {
    // Arrange
    const user = new User();
    user.firstname = "nathan";
    user.surname = 123 as any; // Not a string
    user.password = "verysecurepassword";
    user.email = "test@email.com";
    user.role = new Role();

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "surname")).toBe(true);
  });

  it("should be invalid if password is not a string", async () => {
    // Arrange
    const user = new User();
    user.firstname = "nathan";
    user.surname = "p";
    user.password = 123 as any; // Not a string
    user.email = "test@email.com";
    user.role = new Role();

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "password")).toBe(true);
  });

    it("should be invalid if password is less than 10 characters", async () => {
    // Arrange
    const user = new User();
    user.firstname = "nathan";
    user.surname = "p";
    user.password = "shortpw"; // Less than 10 characters
    user.email = "test@email.com";
    user.role = new Role();
  
    // Act
    const errors = await validate(user);
  
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "password")).toBe(true);
  });

    it("should be invalid if email is not a valid email address", async () => {
    // Arrange
    const user = new User();
    user.firstname = "nathan";
    user.surname = "p";
    user.password = "verysecurepassword";
    user.email = "not-an-email"; // Invalid email
    user.role = new Role();
  
    // Act
    const errors = await validate(user);
  
    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === "email")).toBe(true);
  });

it("should be invalid if role is not provided", async () => {
  // Arrange
  const user = new User();
  user.firstname = "nathan";
  user.surname = "p";
  user.password = "verysecurepassword";
  user.email = "test@email.com";
  user.role = undefined as any; // No role

  // Act
  const errors = await validate(user);

  // Assert
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.some(e => e.property === "role")).toBe(true);
});

it("should be invalid if initialAlTotal is not a number", async () => {
  // Arrange
  const user = new User();
  user.firstname = "nathan";
  user.surname = "p";
  user.password = "verysecurepassword";
  user.email = "test@email.com";
  user.role = new Role();
  user.initialAlTotal = "not-a-number" as any; // Invalid type

  // Act
  const errors = await validate(user);

  // Assert
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.some(e => e.property === "initialAlTotal")).toBe(true);
});

it("should be invalid if initialAlTotal is less than 0", async () => {
  // Arrange
  const user = new User();
  user.firstname = "nathan";
  user.surname = "p";
  user.password = "verysecurepassword";
  user.email = "test@email.com";
  user.role = new Role();
  user.initialAlTotal = -5; // Invalid: less than 0

  // Act
  const errors = await validate(user);

  // Assert
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.some(e => e.property === "initialAlTotal")).toBe(true);
});