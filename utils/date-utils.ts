export function isToday(timestamp: number): boolean {
	const today = new Date();
	const txDate = new Date(timestamp);
	return (
		txDate.getDate() === today.getDate() &&
		txDate.getMonth() === today.getMonth() &&
		txDate.getFullYear() === today.getFullYear()
	);
}

export function isBeforeToday(timestamp: number): boolean {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const txDate = new Date(timestamp);
	txDate.setHours(0, 0, 0, 0);
	return txDate < today;
}

export function formatDate(time: number | undefined | Date): string {
	if (!time) return "Unknown";
	const date = typeof time === "number" ? new Date(time) : time;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
