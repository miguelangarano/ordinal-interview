import { describe, expect, it } from "vitest";
import {
  addMonths,
  dayLabel,
  daysInMonth,
  firstWeekday,
  isMonth,
  monthLabel,
  monthOf,
} from "./month";

describe("month helpers", () => {
  it("validates YYYY-MM strings", () => {
    expect(isMonth("2026-11")).toBe(true);
    expect(isMonth("2026-13")).toBe(false);
    expect(isMonth("2026-1")).toBe(false);
    expect(isMonth("nope")).toBe(false);
    expect(isMonth(undefined)).toBe(false);
  });

  it("reads the month of a date in UTC", () => {
    expect(monthOf(new Date("2026-11-30T23:59:59Z"))).toBe("2026-11");
  });

  it("adds months across year boundaries", () => {
    expect(addMonths("2026-11", 1)).toBe("2026-12");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-11", 18)).toBe("2028-05");
  });

  it("knows how many days each month has", () => {
    expect(daysInMonth("2026-11")).toBe(30);
    expect(daysInMonth("2026-12")).toBe(31);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29); // leap year
  });

  it("finds the weekday the month starts on (0 = Sunday)", () => {
    expect(firstWeekday("2026-11")).toBe(0); // Sunday, Nov 1 2026
    expect(firstWeekday("2026-12")).toBe(2); // Tuesday, Dec 1 2026
  });

  it("formats labels in English without timezone drift", () => {
    expect(monthLabel("2026-11")).toBe("November 2026");
    expect(dayLabel("2026-11-06")).toBe("Friday, November 6");
  });
});
