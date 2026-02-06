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
