export function dateInputValue(date: Date) {
	return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

// Parse calendar fields locally: Date("YYYY-MM-DD") would interpret UTC.
export function parseDateInput(
	value: string,
	minimumDate?: Date,
	maximumDate?: Date,
): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(0);
	date.setFullYear(year, month - 1, day);
	date.setHours(12, 0, 0, 0);
	if (dateInputValue(date) !== value) return null;
	if (minimumDate && value < dateInputValue(minimumDate)) return null;
	if (maximumDate && value > dateInputValue(maximumDate)) return null;
	return date;
}
