import { salonDate, salonParts } from "./salon-time";

/** Keep salon clock fields from source and the salon calendar day from daySource. */
export function mergeLocalCalendarDay(source: Date, daySource: Date) {
	const time = salonParts(source);
	const day = salonParts(daySource);
	return salonDate(
		day.year,
		day.month,
		day.day,
		time.hour,
		time.minute,
		time.second,
		time.millisecond,
	);
}
/** Keep the salon calendar day from source and salon clock fields from timeSource. */
export function mergeLocalTime(source: Date, timeSource: Date) {
	const day = salonParts(source);
	const time = salonParts(timeSource);
	return salonDate(
		day.year,
		day.month,
		day.day,
		time.hour,
		time.minute,
		time.second,
		time.millisecond,
	);
}
export function isAfterEndOfDay(candidate: Date, endOfDay: Date) {
	return candidate.getTime() > endOfDay.getTime();
}
