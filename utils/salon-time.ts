import moment from "moment-timezone";

export const SALON_TIME_ZONE = "America/Vancouver";
export const TRANSACTION_CLOSED_MESSAGE =
	"This day is closed for technician entries and changes after 10 PM Vancouver time. Please contact a manager.";

const inSalon = (value: Date | number) => moment.tz(value, SALON_TIME_ZONE);

export function salonDate(
	year: number,
	month: number,
	day: number,
	hour = 12,
	minute = 0,
	second = 0,
	millisecond = 0,
) {
	const normalized = new Date(0);
	normalized.setUTCFullYear(year, month, day);
	normalized.setUTCHours(hour, minute, second, millisecond);
	return moment
		.tz(
			[
				normalized.getUTCFullYear(),
				normalized.getUTCMonth(),
				normalized.getUTCDate(),
				normalized.getUTCHours(),
				normalized.getUTCMinutes(),
				normalized.getUTCSeconds(),
				normalized.getUTCMilliseconds(),
			],
			SALON_TIME_ZONE,
		)
		.toDate();
}

export function salonParts(value: Date | number) {
	const date = inSalon(value);
	return {
		year: date.year(),
		month: date.month(),
		day: date.date(),
		hour: date.hour(),
		minute: date.minute(),
		second: date.second(),
		millisecond: date.millisecond(),
	};
}

export function salonDayKey(value: Date | number) {
	return inSalon(value).format("YYYY-MM-DD");
}

export function salonDayBounds(value: Date | number) {
	const date = inSalon(value);
	return {
		startOfDay: date.clone().startOf("day").toDate(),
		endOfDay: date.clone().endOf("day").toDate(),
		midDay: date.clone().startOf("day").hour(12).toDate(),
	};
}

export function isSalonToday(value: Date | number, now = Date.now()) {
	return salonDayKey(value) === salonDayKey(now);
}

export function isOpenSalonDay(value: Date | number, now = Date.now()) {
	return (
		Number.isFinite(+value) &&
		isSalonToday(value, now) &&
		inSalon(now).hour() < 22
	);
}

// Format resolved Vancouver clock fields in UTC so stale device Intl data cannot
// reinterpret Vancouver's 2026 rule change. Stored values remain real instants.
export function salonWallDate(value: Date | number) {
	return inSalon(value).utc(true).toDate();
}
export function fromSalonWallDate(value: Date) {
	return salonDate(
		value.getUTCFullYear(),
		value.getUTCMonth(),
		value.getUTCDate(),
		value.getUTCHours(),
		value.getUTCMinutes(),
		value.getUTCSeconds(),
		value.getUTCMilliseconds(),
	);
}
export function salonDateString(
	value: Date | number,
	locale: string | string[] = "en-CA",
	options?: Intl.DateTimeFormatOptions,
) {
	return salonWallDate(value).toLocaleDateString(locale, {
		...options,
		timeZone: "UTC",
	});
}
export function salonTimeString(
	value: Date | number,
	locale: string | string[] = "en-CA",
	options?: Intl.DateTimeFormatOptions,
) {
	return salonWallDate(value).toLocaleTimeString(locale, {
		...options,
		timeZone: "UTC",
	});
}
export function salonDateTimeString(
	value: Date | number,
	locale: string | string[] = "en-CA",
	options?: Intl.DateTimeFormatOptions,
) {
	return salonWallDate(value).toLocaleString(locale, {
		...options,
		timeZone: "UTC",
	});
}
