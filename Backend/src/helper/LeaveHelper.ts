export class LeaveHelper {
  static validateDates(startDate: string | Date, endDate: string | Date): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Start date and end date must be valid dates.");
    }
    if (start < now) {
      throw new Error("Start date cannot be in the past.");
    }
    if (start >= end) {
      throw new Error("Start date must be before end date.");
    }
  }
}