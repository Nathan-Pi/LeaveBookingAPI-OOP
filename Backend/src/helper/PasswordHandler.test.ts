import { PasswordHandler } from "./PasswordHandler";

describe("PasswordHandler", () => {

  it("should hash the password and not return the original password", () => {
    // Arrange
    const password = "testpassword";

    // Act
    const { hashedPassword } = PasswordHandler.hashPassword(password);

    // Assert
    expect(hashedPassword).not.toBe(password);
    expect(typeof hashedPassword).toBe("string");
  });

  it("should verify the password correctly", () => {
    // Arrange
    const password = "testpassword";
    const wrongPassword = "wrongpassword";
    const { hashedPassword, salt } = PasswordHandler.hashPassword(password);

    // Act
    const isCorrect = PasswordHandler.verifyPassword(password, hashedPassword, salt);
    const isIncorrect = PasswordHandler.verifyPassword(wrongPassword, hashedPassword, salt);

    // Assert
    expect(isCorrect).toBe(true);
    expect(isIncorrect).toBe(false);
  });
});