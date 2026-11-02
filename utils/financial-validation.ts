import { moneyToCents, roundMoney } from "./money";

// Leave room for service + supply, tax and tip in safe integer cents.
const MAX_AMOUNT = Math.floor(Number.MAX_SAFE_INTEGER / 4) / 100;
export class FinancialValidationError extends Error {
	constructor(
		public field: string,
		message: string,
	) {
		super(message);
	}
}
const fail = (field: string, message: string): never => {
	throw new FinancialValidationError(field, message);
};

export function assertMoney(value: number, field: string) {
	if (
		!Number.isFinite(value) ||
		value < 0 ||
		value > MAX_AMOUNT ||
		!Number.isSafeInteger(moneyToCents(value))
	) {
		fail(
			field,
			`${field} must be a finite nonnegative amount within the safe currency range`,
		);
	}
}

export function parseAmount(
	value: string | undefined,
	field: string,
	required = false,
	normalize = true,
): number | undefined {
	const text = value?.trim();
	if (!text) {
		if (required) fail(field, `${field} is required`);
		return undefined;
	}
	if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text))
		fail(field, `${field} must be a complete nonnegative decimal amount`);
	const amount = Number(text);
	assertMoney(amount, field);
	return normalize ? roundMoney(amount) : amount;
}

export function assertDate(value: number, field: string) {
	if (!Number.isFinite(value) || Number.isNaN(new Date(value).getTime()))
		fail(field, `${field} must be a valid timestamp`);
}

export type FinancialInput = {
	compensation: string;
	tip: string;
	compensationMethods: string[];
	tipMethods: string[];
	compInCash?: string;
	compInGift?: string;
	tipInCash?: string;
	tipInGift?: string;
	discount?: string;
	discountType?: "Amount" | "Percent";
	supply?: string;
	giftCode?: string;
};

/** Remove portions whose inputs become hidden, including inferred cash fields. */
export function clearHiddenPaymentAmounts<T extends FinancialInput>(
	input: T,
): T {
	return {
		...input,
		compInCash:
			input.compensationMethods.includes("Cash") &&
			input.compensationMethods.includes("Card")
				? input.compInCash
				: "",
		tipInCash:
			input.tipMethods.includes("Cash") && input.tipMethods.includes("Card")
				? input.tipInCash
				: "",
		compInGift: input.compensationMethods.includes("Gift Card")
			? input.compInGift
			: "",
		tipInGift: input.tipMethods.includes("Gift Card") ? input.tipInGift : "",
		giftCode:
			input.compensationMethods.includes("Gift Card") ||
			input.tipMethods.includes("Gift Card")
				? input.giftCode
				: "",
	};
}

function checkMethods(methods: string[], field: string, required: boolean) {
	if (
		(required && methods.length === 0) ||
		new Set(methods).size !== methods.length ||
		methods.some((m) => !["Cash", "Card", "Gift Card"].includes(m))
	) {
		fail(field, `${field} must contain unique supported payment methods`);
	}
}

/** Normalize stored service first, then discount it and round the gift cap. */
export function giftServiceLimit(
	compensation: number,
	discount = 0,
	discountType?: "Amount" | "Percent",
) {
	const service = roundMoney(compensation);
	const reduction =
		discountType === "Percent" ? (service * discount) / 100 : discount;
	return roundMoney(Math.max(0, service - reduction));
}

export function normalizeFinancialInput(input: FinancialInput) {
	const compensation = parseAmount(
		input.compensation,
		"compensation",
		true,
	) as number;
	const tip = parseAmount(input.tip, "tip", true) as number;
	let compInCash = parseAmount(input.compInCash, "compInCash");
	const compInGift = parseAmount(input.compInGift, "compInGift");
	let tipInCash = parseAmount(input.tipInCash, "tipInCash");
	const tipInGift = parseAmount(input.tipInGift, "tipInGift");
	const supply = parseAmount(input.supply, "supply", false, false);
	const discount = parseAmount(input.discount, "discount", false, false);
	checkMethods(input.compensationMethods, "compensationMethods", true);
	checkMethods(input.tipMethods, "tipMethods", tip > 0);
	for (const [field, value, methods, method] of [
		["compInCash", compInCash, input.compensationMethods, "Cash"],
		["compInGift", compInGift, input.compensationMethods, "Gift Card"],
		["tipInCash", tipInCash, input.tipMethods, "Cash"],
		["tipInGift", tipInGift, input.tipMethods, "Gift Card"],
	] as const) {
		if ((value ?? 0) > 0 && !methods.includes(method))
			fail(field, `${field} requires the corresponding payment method`);
	}
	if ((discount ?? 0) > 0 && !input.discountType)
		fail("discountType", "Select a discount type");
	if ((discount ?? 0) > (input.discountType === "Percent" ? 100 : compensation))
		fail("discount", "Discount must not exceed the service price or 100%");
	const serviceDiscount =
		input.discountType === "Percent"
			? (compensation * (discount ?? 0)) / 100
			: (discount ?? 0);
	if (
		moneyToCents(compInGift ?? 0) >
		moneyToCents(giftServiceLimit(compensation, discount, input.discountType))
	)
		fail(
			"compInGift",
			"Gift service must not exceed service compensation after discount",
		);
	const payableCents = moneyToCents(
		(compensation + (supply ?? 0)) * 1.05 - serviceDiscount,
	);
	// With Card, cash is an explicit payable portion. Without Card it is a
	// pre-tax service remainder; reports apply cash discounts/supply separately.
	if (
		input.compensationMethods.includes("Card") &&
		moneyToCents(compInCash ?? 0) + moneyToCents(compInGift ?? 0) > payableCents
	)
		fail(
			"compInGift",
			"Cash and gift amounts must not exceed compensation after discount",
		);
	if (
		moneyToCents(tipInCash ?? 0) + moneyToCents(tipInGift ?? 0) >
		moneyToCents(tip)
	)
		fail("tipInGift", "Cash and gift tips must not exceed total tip");
	const remainder = (
		methods: string[],
		total: number,
		gift: number | undefined,
		explicit: number | undefined,
		field: string,
	) => {
		if (!methods.includes("Cash") || methods.includes("Card")) return explicit;
		const cash = (moneyToCents(total) - moneyToCents(gift ?? 0)) / 100;
		if (explicit !== undefined && moneyToCents(explicit) !== moneyToCents(cash))
			fail(field, `${field} must equal the cash remainder`);
		return cash;
	};
	compInCash = remainder(
		input.compensationMethods,
		compensation,
		compInGift,
		compInCash,
		"compInCash",
	);
	tipInCash = remainder(
		input.tipMethods,
		tip,
		tipInGift,
		tipInCash,
		"tipInCash",
	);
	const usesGift =
		input.compensationMethods.includes("Gift Card") ||
		input.tipMethods.includes("Gift Card");
	if (usesGift && !input.giftCode?.trim())
		fail("giftCode", "Gift card code is required");
	return {
		compensation,
		tip,
		compInCash,
		compInGift,
		tipInCash,
		tipInGift,
		supply,
		discount,
		discountType: discount === undefined ? undefined : input.discountType,
		usesGift,
	};
}

type CashAmounts = {
	compensation?: number;
	tip?: number;
	compInCash?: number;
	compInGift?: number;
	tipInCash?: number;
	tipInGift?: number;
	compensationMethods?: string[];
	tipMethods?: string[];
};
function cashAmount(
	methods: string[] | undefined,
	total = 0,
	explicit = 0,
	gift = 0,
) {
	if (!methods?.includes("Cash")) return 0;
	return methods.includes("Card")
		? explicit
		: (moneyToCents(total) - moneyToCents(gift)) / 100;
}
export const getCashCompensation = (tx: CashAmounts) =>
	cashAmount(
		tx.compensationMethods,
		tx.compensation,
		tx.compInCash,
		tx.compInGift,
	);
export const getCashTip = (tx: CashAmounts) =>
	cashAmount(tx.tipMethods, tx.tip, tx.tipInCash, tx.tipInGift);

export function cashRemainderPreview(
	total: string,
	gift: string | undefined,
): number | undefined {
	try {
		const amount = parseAmount(total, "total", true) as number;
		const portion = parseAmount(gift, "gift") ?? 0;
		return portion <= amount
			? (moneyToCents(amount) - moneyToCents(portion)) / 100
			: undefined;
	} catch (error) {
		if (!(error instanceof FinancialValidationError)) throw error;
		return undefined;
	}
}
