import { salonDate, salonDayKey } from "@/utils/salon-time";

export function dateInputValue(date: Date) {
	return salonDayKey(date);
}
export function parseDateInput(
	value: string,
	minimumDate?: Date,
	maximumDate?: Date,
): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	const date = salonDate(year, month - 1, day);
	if (dateInputValue(date) !== value) return null;
	if (minimumDate && value < dateInputValue(minimumDate)) return null;
	if (maximumDate && value > dateInputValue(maximumDate)) return null;
	return date;
}
