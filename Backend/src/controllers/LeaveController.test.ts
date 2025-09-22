import { LeaveController } from "./LeaveController";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

describe("LeaveController - requestLeave", () => {
  it("should return 400 if startDate or endDate is missing", async () => {
    // Arrange
    const leaveController = new LeaveController();
    const req = {
      body: { startDate: null, endDate: null, reason: "Holiday" },
      signedInUser: { email: "test@email.com" }
    } as any as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any as Response;

    // Act
    await leaveController.requestLeave(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.objectContaining({
          message: expect.stringContaining("Start date cannot be in the past."),
          })
        })
      )
    });

it("should return 400 if startDate is after or equal to endDate", async () => {
  // Arrange
  const leaveController = new LeaveController();
  const req = {
    body: { startDate: "2025-06-20", endDate: "2025-06-10", reason: "Holiday" },
    signedInUser: { email: "test@email.com" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any as Response;

  // Act
  await leaveController.requestLeave(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.objectContaining({
        message: expect.stringContaining("Start date must be before end date.")
      })
    })
  );
});

it("should return 400 if user is not found", async () => {
  // Arrange
  const leaveController = new LeaveController();
  // Mock AppDataSource.getRepository(User).findOne to return null
  jest.spyOn(require("../data-source").AppDataSource, "getRepository").mockReturnValue({
    findOne: jest.fn().mockResolvedValue(null)
  } as any);

  const req = {
    body: { startDate: "2025-06-10", endDate: "2025-06-12", reason: "Holiday" },
    signedInUser: { email: "notfound@email.com" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any as Response;

  // Act
  await leaveController.requestLeave(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.objectContaining({
        message: expect.stringContaining("User not found")
      })
    })
  );
});


//ApproveLeave tests

it("should return 403 if user is not admin or manager when approving leave", async () => {
  // Arrange
  const leaveController = new LeaveController();
  const req = {
    signedInUser: { role: { id: 3 }, email: "user@email.com" }, // Not admin (1) or manager (2)
    params: { id: "1" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  // Act
  await leaveController.approveLeave(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);
});

it("should return 400 if leave request id param is missing when approving leave", async () => {
  // Arrange
  const leaveController = new LeaveController();
  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { } // No id provided
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  // Act
  await leaveController.approveLeave(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);
  // expect(res.json).toHaveBeenCalledWith(
  //   expect.objectContaining({
  //     error: expect.stringContaining("Invalid leave request ID")
  //   })
  // );
});

it("should return 400 if leave request is not found when approving leave", async () => {
  // Arrange
  const leaveController = new LeaveController();

  // Mock leaveRepository to return null for findOne
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "LeaveRequest") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue({ id: 1, email: "admin@email.com" }) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  // Act
  await leaveController.approveLeave(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request")
    })
  );
});

// it("should return 403 if manager tries to approve a leave request for a user not under them", async () => {
//   // Arrange
//   const leaveController = new LeaveController();

//   // Mock manager and unrelated user
//   const managerEmail = "manager@email.com";
//   const unrelatedUser = { id: 2, email: "notmyuser@email.com" };
//   const mockLeaveRequest = {
//     leaveId: 123,
//     startDate: new Date("2025-06-10"),
//     endDate: new Date("2025-06-12"),
//     reason: "Holiday",
//     user: unrelatedUser
//   };

//   // Mock leaveRepository to return the leave request
//   jest.spyOn(require("../data-source").AppDataSource, "getRepository")
//     .mockImplementation((entity: { name: string }) => {
//       if (entity.name === "LeaveRequest") {
//         return { findOne: jest.fn().mockResolvedValue(mockLeaveRequest) };
//       }
//       if (entity.name === "User") {
//         // Manager user, with no staff under them
//         return {
//           findOne: jest.fn().mockResolvedValue({ id: 1, email: managerEmail }),
//           find: jest.fn().mockResolvedValue([]) // No staff under this manager
//         };
//       }
//       return {};
//     });

//   // Simulate manager with role id 2
//   const req = {
//     signedInUser: { role: { id: 2 }, email: managerEmail },
//     params: { id: "123" }
//   } as any as Request;
//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//     send: jest.fn()
//   } as any as Response;

//   // Act
//   await leaveController.approveLeave(req, res);

//   // Assert
//   expect(res.status).toHaveBeenCalledWith(403);
//   expect(res.json).toHaveBeenCalledWith(
//     expect.objectContaining({
//       error: expect.stringContaining("You are not authorized to approve this leave request.")
//     })
//   );
// });

// it("should return 400 if user does not have enough annual leave when approving leave", async () => {
//   // Arrange
//   const leaveController = new LeaveController();

//   // Mock user and leave request with insufficient leave
//   const mockUser = { id: 1, email: "user@email.com", initialAlTotal: 0, remainingAl: 0 };
//   const mockLeaveRequest = {
//     leaveId: 123,
//     startDate: new Date("2025-06-10"),
//     endDate: new Date("2025-06-12"),
//     reason: "Holiday",
//     user: { ...mockUser } // Ensure this is a copy, not a reference, if your controller compares objects
//   };

//   jest.spyOn(require("../data-source").AppDataSource, "getRepository")
//     .mockImplementation((entity: { name: string }) => {
//       if (entity.name === "LeaveRequest") {
//         return { findOne: jest.fn().mockResolvedValue(mockLeaveRequest) };
//       }
//       if (entity.name === "User") {
//         return { findOne: jest.fn().mockResolvedValue(mockUser) };
//       }
//       return {};
//     });

//   const req = {
//     signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
//     params: { id: "123" }
//   } as any as Request;
//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//     send: jest.fn()
//   } as any as Response;

//   // Act
//   await leaveController.approveLeave(req, res);

//   // Assert
//   expect(res.status).toHaveBeenCalledWith(400);
//   expect(res.json).toHaveBeenCalledWith(
//     expect.objectContaining({
//       error: expect.stringContaining("Not enough annual leave balance")
//     })
//   );
// });

it("should return 403 if a non-admin/non-manager tries to approve leave", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 3 }, email: "user@email.com" }, // Not admin (1) or manager (2)
    params: { id: "1" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.approveLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
});

//reject leave tests


it("should return 403 if user is not admin or manager when rejecting leave", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 3 }, email: "user@email.com" }, // Not admin (1) or manager (2)
    params: { id: "1" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.rejectLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

});

it("should return 400 if leave request is not found when rejecting leave", async () => {
  const leaveController = new LeaveController();

  // Mock leaveRepository to return null for findOne
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "LeaveRequest") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue({ id: 1, email: "admin@email.com" }) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.rejectLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request")
    })
  );
});

//successfully rejects leave

//getAllLeaveRequests tests

//should return all requests if user is admin, manager and 404 for none found

//Cancel leave tests

it("should return 400 if leave request id param is missing when cancelling leave", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin or any user
    params: {} // No id provided
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.cancelLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request ID")
    })
  );
});

it("should return 400 if leave request is not found when cancelling leave", async () => {
  const leaveController = new LeaveController();

  // Mock leaveRepository to return null for findOne
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "LeaveRequest") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue({ id: 1, email: "admin@email.com" }) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin or any user
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.cancelLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request")
    })
  );
});

//Returns 403 if user is not the owner of request, or admin, or manager of the request owner.

//Successfully cancels leave request, returns 200.

//amendLeave tests

it("should return 403 if user is not admin when amending leave", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 2 }, email: "manager@email.com" }, // Not admin (role id 1)
    params: { id: "123" },
    body: { startDate: "2025-06-15", endDate: "2025-06-18", reason: "Updated Reason" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.amendLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("You are not authorized to amend leave amounts.")
    })
  );
});

it("should return 400 if leave request id or amount is missing when amending leave", async () => {
  const leaveController = new LeaveController();

  // Missing id
  let req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: {}, // No id
    body: { amount: 2 }
  } as any as Request;
  let res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.amendLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request ID or amount")
    })
  );

  // Missing amount
  req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "123" },
    body: {} // No amount
  } as any as Request;
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.amendLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid leave request ID or amount")
    })
  );
});

it("should return 400 if user is not found when amending leave", async () => {
  const leaveController = new LeaveController();

  // Mock user repository to return null
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      if (entity.name === "LeaveRequest") {
        return { findOne: jest.fn().mockResolvedValue({}) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "notfound@email.com" }, // Admin
    params: { id: "123" },
    body: { amount: 2 }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.amendLeave(req, res);

  expect(res.json).toHaveBeenCalledWith(
  expect.objectContaining({
    error: expect.stringContaining("Invalid user")
  })
);
});

//Successfully amends user's annual leave, returns 200.

//outstandingLeavebyStaffID tests

it("should return 403 if user is not admin when viewing outstanding leave by staff ID", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 2 }, email: "manager@email.com" }, // Not admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyStaffID(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("You are not authorized to view outstanding leave requests.")
    })
  );
});

it("should return 400 if staff ID param is missing when viewing outstanding leave by staff ID", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: {} // No id provided
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyStaffID(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
  expect.objectContaining({
    error: expect.stringContaining("Invalid user ID")
  })
);
});

it("should return 400 if staff ID param is not a number when viewing outstanding leave by staff ID", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "notANumber" } // Invalid id
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyStaffID(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid user ID")
    })
  );
});



it("should return 400 if user is not found when viewing outstanding leave by staff ID", async () => {
  const leaveController = new LeaveController();

  // Mock user repository to return null
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyStaffID(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid user")
    })
  );
});

// outstandingLeavebyManager tests

it("should return 403 if user is not admin when viewing outstanding leave by manager", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 2 }, email: "manager@email.com" }, // Not admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyManager(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("You are not authorized to view outstanding leave requests.")
    })
  );
});

it("should return 400 if manager ID param is missing when viewing outstanding leave by manager", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: {} // No id provided
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyManager(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid user ID")
    })
  );
});

it("should return 400 if manager ID param is not a number when viewing outstanding leave by manager", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "notANumber" } // Invalid id
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyManager(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid user ID")
    })
  );
});

it("should return 400 if manager user is not found when viewing outstanding leave by manager", async () => {
  const leaveController = new LeaveController();

  // Mock user repository to return null
  jest.spyOn(require("../data-source").AppDataSource, "getRepository")
    .mockImplementation((entity: { name: string }) => {
      if (entity.name === "User") {
        return { findOne: jest.fn().mockResolvedValue(null) };
      }
      return {};
    });

  const req = {
    signedInUser: { role: { id: 1 }, email: "admin@email.com" }, // Admin
    params: { id: "123" }
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeavebyManager(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("Invalid user")
    })
  );
});

it("should return 403 if user is not admin when viewing outstanding leave", async () => {
  const leaveController = new LeaveController();

  const req = {
    signedInUser: { role: { id: 2 }, email: "manager@email.com" }, // Not admin
  } as any as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  } as any as Response;

  await leaveController.outstandingLeave(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining("You are not authorized to view outstanding leave requests.")
    })
  );
});

});
