import { useEffect } from "react";
import { Text } from "react-native";
import { cn, type EarningFormState, type Gift } from "@/utils";
import {
	FinancialValidationError,
	giftServiceLimit,
	parseAmount,
} from "@/utils/financial-validation";
import { giftUsageCents, moneyToCents } from "@/utils/money";
import { ErrorText } from "./form";
import { formatCurrency } from "./helpers";
import { NumericInput } from "./numeric-input";

type GiftType = "tipInGift" | "compInGift";

type GiftCardInputsProps = {
	earning: EarningFormState;
	updateEarning: <K extends keyof EarningFormState>(
		key: K,
		value: EarningFormState[K],
	) => void;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	giftCard?: Gift | null;
	type?: GiftType;
};

export const GiftCardInputs = ({
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	type,
}: GiftCardInputsProps) => {
	const {
		giftCode,
		tipInGift,
		compInGift,
		supply,
		discount,
		compensation,
		discountType,
	} = earning;

	const maxCompGiftAmount = giftServiceLimit(
		parseCurrencyValue(compensation),
		parseCurrencyValue(discount),
		discountType,
	);
	const availableBalance = giftCard?.balance
		? calculateAvailableBalance(giftCard.balance, compInGift, tipInGift, supply)
		: 0;

	useEffect(() => {
		if (!giftCard) {
			setGiftError("");
			return;
		}

		if (
			type === "compInGift" &&
			parseCurrencyValue(compInGift, true) > maxCompGiftAmount
		) {
			setGiftError(
				`Gift card amount cannot exceed $${maxCompGiftAmount.toFixed(2)} after discount`,
			);
			return;
		}

		if (availableBalance < 0) {
			setGiftError(
				`Gift card balance insufficient. Available: $${availableBalance.toFixed(2)}`,
			);
			return;
		}

		setGiftError("");
	}, [
		availableBalance,
		compInGift,
		giftCard,
		maxCompGiftAmount,
		setGiftError,
		type,
	]);

	if (!type) return null;

	const handleCodeChange = (value: string) => {
		updateEarning("giftCode", value);
		setGiftError("");
	};

	const handleAmountChange = (value: string) => {
		updateEarning(type, value);
		if (!giftCard) return;

		if (
			type === "compInGift" &&
			parseCurrencyValue(value, true) > maxCompGiftAmount
		) {
			setGiftError(
				`Gift card amount cannot exceed $${maxCompGiftAmount.toFixed(2)} after discount`,
			);
			return;
		}

		const totalCents = calculateTotalUsage(
			type,
			value,
			tipInGift ?? "",
			compInGift ?? "",
			supply ?? "",
		);
		const balanceCents = moneyToCents(giftCard.balance ?? 0);

		if (totalCents > balanceCents) {
			setGiftError(
				`Gift card balance insufficient. Total usage with Tax: ${formatCurrency(totalCents)}, Available: ${formatCurrency(balanceCents)}`,
			);
		} else {
			setGiftError("");
		}
	};

	const showNotFoundError = giftCode && giftCard === null;

	return (
		<>
			<NumericInput
				placeholder="Enter Gift Card Code"
				inputMode="numeric"
				value={giftCode}
				onChangeText={handleCodeChange}
				icon="barcode"
				iconSize={24}
			/>

			{showNotFoundError && <ErrorText error="Gift card code not found" />}

			{giftCard ? (
				<>
					<Text className={cn("px-4 text-foreground text-sm")}>
						Available balance: ${availableBalance.toFixed(2)}
					</Text>
					<NumericInput
						placeholder={
							type === "compInGift"
								? `Enter amount from Gift Card. Max $${maxCompGiftAmount.toFixed(2)}`
								: "Enter amount from Gift Card"
						}
						value={earning[type]?.toString()}
						onChangeText={handleAmountChange}
						icon="wallet-giftcard"
						iconSize={24}
					/>
				</>
			) : null}

			{giftError && <ErrorText error={giftError} />}
		</>
	);
};

/* ----------------------------- Utility Functions ----------------------------- */

const parseCurrencyValue = (value?: string, normalize = false): number => {
	try {
		// Invalid draft text is handled by the form schema, not currency arithmetic.
		return parseAmount(value, "gift preview", false, normalize) ?? 0;
	} catch (error) {
		if (!(error instanceof FinancialValidationError)) throw error;
		return 0;
	}
};

const calculateTotalUsage = (
	type: GiftType,
	currentValue: string,
	tipInGift: string,
	compInGift: string,
	supply: string,
): number => {
	const isComp = type === "compInGift";

	return giftUsageCents({
		compInGift: parseCurrencyValue(isComp ? currentValue : compInGift),
		tipInGift: parseCurrencyValue(isComp ? tipInGift : currentValue),
		supply: parseCurrencyValue(supply),
	});
};

const calculateAvailableBalance = (
	balance: number,
	compInGift?: string,
	tipInGift?: string,
	supply?: string,
): number => {
	return (
		(moneyToCents(balance) -
			giftUsageCents({
				compInGift: parseCurrencyValue(compInGift),
				tipInGift: parseCurrencyValue(tipInGift),
				supply: parseCurrencyValue(supply),
			})) /
		100
	);
};
