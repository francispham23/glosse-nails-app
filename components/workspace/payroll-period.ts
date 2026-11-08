import { salonDate, salonParts } from "@/utils/salon-time";

export function getCompletedPayrollPeriod(today: Date) {
	const { year, month, day } = salonParts(today);
	if (day <= 15) {
		return {
			start: salonDate(year, month - 1, 16),
			end: salonDate(year, month, 0),
		};
	}
	return { start: salonDate(year, month, 1), end: salonDate(year, month, 15) };
}
