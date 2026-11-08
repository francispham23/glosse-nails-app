import { expect, test } from "@jest/globals";
import {
	isAfterEndOfDay,
	mergeLocalCalendarDay,
	mergeLocalTime,
} from "@/utils/local-datetime";
import { salonDate, salonParts } from "@/utils/salon-time";

test("mergeLocalCalendarDay keeps clock fields", () => {
	const source = salonDate(2026, 5, 15, 14, 30, 45, 123);
	const daySource = salonDate(2026, 0, 3, 9, 0, 0, 0);
	const merged = mergeLocalCalendarDay(source, daySource);
	expect(salonParts(merged).year).toBe(2026);
	expect(salonParts(merged).month).toBe(0);
	expect(salonParts(merged).day).toBe(3);
	expect(salonParts(merged).hour).toBe(14);
	expect(salonParts(merged).minute).toBe(30);
	expect(salonParts(merged).second).toBe(45);
	expect(salonParts(merged).millisecond).toBe(123);
});

test("mergeLocalTime keeps calendar day", () => {
	const source = salonDate(2026, 5, 15, 14, 30, 0, 0);
	const timeSource = salonDate(2026, 0, 1, 8, 15, 0, 0);
	const merged = mergeLocalTime(source, timeSource);
	expect(salonParts(merged).year).toBe(2026);
	expect(salonParts(merged).month).toBe(5);
	expect(salonParts(merged).day).toBe(15);
	expect(salonParts(merged).hour).toBe(8);
	expect(salonParts(merged).minute).toBe(15);
});

test("isAfterEndOfDay compares instants", () => {
	const end = salonDate(2026, 5, 15, 23, 59, 59, 999);
	const before = salonDate(2026, 5, 15, 23, 59, 0, 0);
	const after = salonDate(2026, 5, 16, 0, 0, 0, 0);
	expect(isAfterEndOfDay(before, end)).toBe(false);
	expect(isAfterEndOfDay(after, end)).toBe(true);
});
