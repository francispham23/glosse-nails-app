/** Round a decimal dollar amount to cents, with positive ties rounded up. */
export const moneyToCents = (amount: number): number => {
	// Shift the decimal exponent without multiplying a binary float by 100.
	const [coefficient, exponent = "0"] = amount.toString().split("e");
	return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`));
};

export const roundMoney = (amount: number): number =>
	moneyToCents(amount) / 100;

const decimalRatio = (amount: number): [bigint, bigint] => {
	const [coefficient, exponent = "0"] = amount.toString().split("e");
	const scale = (coefficient.split(".")[1]?.length ?? 0) - Number(exponent);
	return [
		BigInt(coefficient.replace(".", "")) * 10n ** BigInt(Math.max(0, -scale)),
		10n ** BigInt(Math.max(0, scale)),
	];
};

const roundRatio = (numerator: bigint, denominator: bigint): number =>
	Number((numerator + denominator / 2n) / denominator);

/** Sum decimal commissions exactly; round only the final total. */
export const payrollCompensation = (
	entries: { compensation: number; payRate: number }[],
): number => {
	let numerator = 0n;
	let denominator = 1n;
	for (const entry of entries) {
		const [amountNumerator, amountDenominator] = decimalRatio(
			entry.compensation,
		);
		const [rateNumerator, rateDenominator] = decimalRatio(entry.payRate);
		const entryDenominator = amountDenominator * rateDenominator;
		const commonDenominator =
			denominator > entryDenominator ? denominator : entryDenominator;
		numerator =
			numerator * (commonDenominator / denominator) +
			amountNumerator *
				rateNumerator *
				100n *
				(commonDenominator / entryDenominator);
		denominator = commonDenominator;
	}
	return roundRatio(numerator, denominator) / 100;
};

/** One redemption: tax the combined service/supply once, then add untaxed tip. */
export const giftUsageCents = (transaction: {
	compInGift?: number;
	supply?: number;
	tipInGift?: number;
}): number => {
	// Gift service/tip persist in cents; supply may retain fractional cents.
	const [supplyNumerator, supplyDenominator] = decimalRatio(
		transaction.supply ?? 0,
	);
	const taxableNumerator =
		BigInt(moneyToCents(transaction.compInGift ?? 0)) * supplyDenominator +
		supplyNumerator * 100n;
	return (
		roundRatio(taxableNumerator * 105n, supplyDenominator * 100n) +
		moneyToCents(transaction.tipInGift ?? 0)
	);
};
