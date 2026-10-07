// Use calendar fields rather than elapsed days, including across DST and year end.
export function getCompletedPayrollPeriod(today: Date) {
	const year = today.getFullYear();
	const month = today.getMonth();
	if (today.getDate() <= 15) {
		return {
			start: new Date(year, month - 1, 16, 12),
			end: new Date(year, month, 0, 12),
		};
	}
	return {
		start: new Date(year, month, 1, 12),
		end: new Date(year, month, 15, 12),
	};
}
