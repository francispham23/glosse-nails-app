export const getPaymentPlaceholder = (
	hasCard: boolean,
	hasCash: boolean,
	hasGift: boolean,
	isTip = false,
): string => {
	const types = [hasCard && "Card", hasCash && "Cash", hasGift && "Gift Card"]
		.filter(Boolean)
		.join(", ")
		.replace(/, ([^,]*)$/, " and $1");

	return types ? `Enter Total ${isTip ? "Tip" : "Charge"} in ${types}` : "";
};

/* ----------------------------- Currency Utils ----------------------------- */

/** Parse dollar string to cents (integer) */
export const toCents = (dollars: string): number =>
	Math.round(Number.parseFloat(dollars || "0") * 100);

/** Convert cents to dollars (for display) */
export const fromCents = (cents: number): number => cents / 100;

/** Format cents as currency string */
export const formatCurrency = (cents: number): string =>
	`$${fromCents(cents).toFixed(2)}`;

/** Round dollars to 2 decimal places (use when cents not practical) */
export const roundCurrency = (dollars: number): number =>
	Math.round(dollars * 100) / 100;
