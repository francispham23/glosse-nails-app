import { expect, test } from "@jest/globals";
import {
	fromSalonWallDate,
	isOpenSalonDay,
	salonDate,
	salonDayBounds,
	salonDayKey,
	salonParts,
	salonWallDate,
} from "@/utils/salon-time";

test("Vancouver uses historical DST and permanent UTC-7 after March 2026", () => {
	expect(salonDate(2025, 0, 1, 0).toISOString()).toBe(
		"2025-01-01T08:00:00.000Z",
	);
	expect(salonDate(2025, 6, 1, 0).toISOString()).toBe(
		"2025-07-01T07:00:00.000Z",
	);
	expect(salonDate(2026, 10, 8, 0).toISOString()).toBe(
		"2026-11-08T07:00:00.000Z",
	);
	expect(salonDayKey(Date.parse("2026-11-08T06:59:59Z"))).toBe("2026-11-07");
	expect(
		salonDayBounds(Date.parse("2026-11-08T12:00:00Z")).endOfDay.toISOString(),
	).toBe("2026-11-09T06:59:59.999Z");
});
test("technician day closes at exactly 22:00 and next day opens at midnight", () => {
	const day = salonDate(2026, 10, 7);
	expect(isOpenSalonDay(day, Date.parse("2026-11-08T04:59:59.999Z"))).toBe(
		true,
	);
	expect(isOpenSalonDay(day, Date.parse("2026-11-08T05:00:00Z"))).toBe(false);
	expect(isOpenSalonDay(day, Date.parse("2026-11-08T07:00:00Z"))).toBe(false);
	expect(
		isOpenSalonDay(salonDate(2026, 10, 8), Date.parse("2026-11-08T07:00:00Z")),
	).toBe(true);
});
test("native picker wall fields round trip without host timezone conversion", () => {
	const instant = salonDate(2026, 10, 7, 21, 45);
	const wall = salonWallDate(instant);
	expect(wall.getUTCHours()).toBe(21);
	expect(wall.getUTCDate()).toBe(7);
	expect(fromSalonWallDate(wall)).toEqual(instant);
	expect(salonParts(instant)).toMatchObject({
		year: 2026,
		month: 10,
		day: 7,
		hour: 21,
		minute: 45,
	});
});
