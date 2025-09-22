import { validate } from "class-validator";
import { LeaveRequest } from "../entity/LeaveRequest";
import { User } from "../entity/User";

describe("LeaveRequest Entity", () => {
  it("should create a LeaveRequest with correct fields", () => {
    // Arrange
    const mockUser = new User();
    mockUser.id = 1;
    mockUser.firstname = "Test";
    mockUser.surname = "User";
    mockUser.email = "testuser@email.com";
    mockUser.password = "password12345";

    const startDate = new Date("2025-06-01");
    const endDate = new Date("2025-06-10");
    const reason = "Vacation";

    // Act
    const leaveRequest = new LeaveRequest();
    leaveRequest.user = mockUser;
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.reason = reason;
    leaveRequest.status = "Pending";

    // Assert
    expect(leaveRequest.user).toBe(mockUser);
    expect(leaveRequest.startDate).toBe(startDate);
    expect(leaveRequest.endDate).toBe(endDate);
    expect(leaveRequest.reason).toBe(reason);
    expect(leaveRequest.status).toBe("Pending");
  });
 
});