import { expect, test } from "@jest/globals";
import {
	isAfterEndOfDay,
	mergeLocalCalendarDay,
	mergeLocalTime,
} from "@/utils/local-datetime";

test("mergeLocalCalendarDay keeps clock fields", () => {
	const source = new Date(2026, 5, 15, 14, 30, 45, 123);
	const daySource = new Date(2026, 0, 3, 9, 0, 0, 0);
	const merged = mergeLocalCalendarDay(source, daySource);
	expect(merged.getFullYear()).toBe(2026);
	expect(merged.getMonth()).toBe(0);
	expect(merged.getDate()).toBe(3);
	expect(merged.getHours()).toBe(14);
	expect(merged.getMinutes()).toBe(30);
	expect(merged.getSeconds()).toBe(45);
	expect(merged.getMilliseconds()).toBe(123);
});

test("mergeLocalTime keeps calendar day", () => {
	const source = new Date(2026, 5, 15, 14, 30, 0, 0);
	const timeSource = new Date(2026, 0, 1, 8, 15, 0, 0);
	const merged = mergeLocalTime(source, timeSource);
	expect(merged.getFullYear()).toBe(2026);
	expect(merged.getMonth()).toBe(5);
	expect(merged.getDate()).toBe(15);
	expect(merged.getHours()).toBe(8);
	expect(merged.getMinutes()).toBe(15);
});

test("isAfterEndOfDay compares instants", () => {
	const end = new Date(2026, 5, 15, 23, 59, 59, 999);
	const before = new Date(2026, 5, 15, 23, 59, 0, 0);
	const after = new Date(2026, 5, 16, 0, 0, 0, 0);
	expect(isAfterEndOfDay(before, end)).toBe(false);
	expect(isAfterEndOfDay(after, end)).toBe(true);
});
