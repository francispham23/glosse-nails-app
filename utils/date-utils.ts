import { isSalonToday, salonDateString, salonDayKey } from "./salon-time";

export function isToday(timestamp: number): boolean {
	return isSalonToday(timestamp);
}
export function isBeforeToday(timestamp: number): boolean {
	return salonDayKey(timestamp) < salonDayKey(Date.now());
}
export function formatDate(
	time: number | undefined | Date,
	hasYear = true,
): string {
	if (time === undefined) return "Unknown";
	return salonDateString(time, "en-US", {
		month: "short",
		day: "numeric",
		year: hasYear ? "numeric" : undefined,
	});
}
