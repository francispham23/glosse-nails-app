/** Keep clock fields from `source` and replace the calendar day from `daySource`. */
export function mergeLocalCalendarDay(source: Date, daySource: Date) {
	const next = new Date(source);
	next.setFullYear(
		daySource.getFullYear(),
		daySource.getMonth(),
		daySource.getDate(),
	);
	return next;
}

/** Keep the calendar day from `source` and replace clock fields from `timeSource`. */
export function mergeLocalTime(source: Date, timeSource: Date) {
	const next = new Date(source);
	next.setHours(
		timeSource.getHours(),
		timeSource.getMinutes(),
		timeSource.getSeconds(),
		timeSource.getMilliseconds(),
	);
	return next;
}

export function isAfterEndOfDay(candidate: Date, endOfDay: Date) {
	return candidate.getTime() > endOfDay.getTime();
}
