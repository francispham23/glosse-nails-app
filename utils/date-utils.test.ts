import { describe, it, expect } from "vitest";
import { isToday, isBeforeToday, formatDate } from "./date-utils";

describe("isToday", () => {
	it("returns true for a timestamp set to today", () => {
		const now = new Date();
		now.setHours(15, 0, 0, 0);
		expect(isToday(now.getTime())).toBe(true);
	});

	it("returns false for yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(isToday(yesterday.getTime())).toBe(false);
	});

	it("returns false for tomorrow", () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expect(isToday(tomorrow.getTime())).toBe(false);
	});
});

describe("isBeforeToday", () => {
	it("returns true for yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(12, 0, 0, 0);
		expect(isBeforeToday(yesterday.getTime())).toBe(true);
	});

	it("returns false for today", () => {
		expect(isBeforeToday(Date.now())).toBe(false);
	});

	it("returns false for tomorrow", () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expect(isBeforeToday(tomorrow.getTime())).toBe(false);
	});
});

describe("formatDate", () => {
	it("returns 'Unknown' for falsy input", () => {
		expect(formatDate(undefined)).toBe("Unknown");
		expect(formatDate(0)).toBe("Unknown");
	});

	it("includes the year by default", () => {
		const d = new Date(2024, 0, 15); // Jan 15 2024
		expect(formatDate(d.getTime())).toMatch(/2024/);
		expect(formatDate(d)).toMatch(/Jan 15, 2024/);
	});

	it("omits the year when hasYear is false", () => {
		const d = new Date(2024, 0, 15);
		const out = formatDate(d.getTime(), false);
		expect(out).not.toMatch(/2024/);
		expect(out).toMatch(/Jan 15/);
	});
});
