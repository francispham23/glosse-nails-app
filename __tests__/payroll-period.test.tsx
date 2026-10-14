import { expect, test } from "@jest/globals";
import { dateInputValue } from "@/components/workspace/date-value";
import { getCompletedPayrollPeriod } from "@/components/workspace/payroll-period";

test.each<[number, number, number, string, string]>([
	[2026, 10, 5, "2026-09-16", "2026-09-30"],
	[2026, 10, 15, "2026-09-16", "2026-09-30"],
	[2026, 10, 16, "2026-10-01", "2026-10-15"],
	[2026, 10, 31, "2026-10-01", "2026-10-15"],
	[2026, 11, 1, "2026-10-16", "2026-10-31"],
	[2026, 1, 1, "2025-12-16", "2025-12-31"],
	[2026, 3, 1, "2026-02-16", "2026-02-28"],
	[2024, 3, 1, "2024-02-16", "2024-02-29"],
	[2026, 5, 1, "2026-04-16", "2026-04-30"],
	[2026, 3, 16, "2026-03-01", "2026-03-15"],
	[2026, 11, 16, "2026-11-01", "2026-11-15"],
])(
	"Payroll on %i-%i-%i selects %s through %s",
	(year, month, day, expectedStart, expectedEnd) => {
		const today = new Date(year, month - 1, day, 23, 59);
		const originalTime = today.getTime();
		const period = getCompletedPayrollPeriod(today);
		expect(dateInputValue(period.start)).toBe(expectedStart);
		expect(dateInputValue(period.end)).toBe(expectedEnd);
		expect(period.start.getHours()).toBe(12);
		expect(period.end.getHours()).toBe(12);
		expect(today.getTime()).toBe(originalTime);
	},
);
