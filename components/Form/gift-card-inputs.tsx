import { useEffect } from "react";
import { Text } from "react-native";
import { TextInput } from "react-native-paper";

import { useAppTheme } from "@/contexts/app-theme-context";
import { cn, type EarningFormState, type Gift } from "@/utils";
import { TAX_RATE } from "./constants";
import { ErrorText } from "./form";
import { formatCurrency, roundCurrency, toCents } from "./helpers";

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
	const { isLight } = useAppTheme();
	const { giftCode, tipInGift, compInGift, supply, discount, compensation } =
		earning;

	const maxCompGiftAmount = calculateMaxCompGiftAmount(compensation, discount);
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
			parseCurrencyValue(compInGift) > maxCompGiftAmount
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
			parseCurrencyValue(value) > maxCompGiftAmount
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
		const balanceCents = toCents((giftCard.balance ?? 0).toString());

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
			<TextInput
				mode="outlined"
				placeholder="Enter Gift Card Code"
				keyboardType="numeric"
				autoCapitalize="none"
				value={giftCode}
				onChangeText={handleCodeChange}
				left={<TextInput.Icon icon="barcode" />}
				className="h-16 rounded-3xl"
			/>

			{showNotFoundError && <ErrorText error="Gift card code not found" />}

			{giftCard && (
				<>
					<Text
						className={cn(
							"px-4 text-foreground text-sm",
							!isLight && "text-gray-300",
						)}
					>
						Available balance: ${availableBalance.toFixed(2)}
					</Text>
					<TextInput
						mode="outlined"
						placeholder={
							type === "compInGift"
								? `Enter amount from Gift Card. Max $${maxCompGiftAmount.toFixed(2)}`
								: "Enter amount from Gift Card"
						}
						keyboardType="numeric"
						autoCapitalize="none"
						value={earning[type]?.toString()}
						onChangeText={handleAmountChange}
						left={<TextInput.Icon icon="wallet-giftcard" />}
						className="h-16 rounded-3xl"
					/>
				</>
			)}

			{giftError && <ErrorText error={giftError} />}
		</>
	);
};

/* ----------------------------- Utility Functions ----------------------------- */

const parseCurrencyValue = (value?: string): number => {
	const parsed = Number.parseFloat(value ?? "0");
	return Number.isNaN(parsed) ? 0 : parsed;
};

const calculateMaxCompGiftAmount = (
	compensation: string,
	discount?: string,
): number =>
	roundCurrency(
		Math.max(
			0,
			parseCurrencyValue(compensation) - parseCurrencyValue(discount),
		),
	);

const calculateAmountWithTax = (value: string, applyTax: boolean): number => {
	const cents = toCents(value);
	return applyTax ? Math.round(cents * TAX_RATE) : cents;
};

const calculateTotalUsage = (
	type: GiftType,
	currentValue: string,
	tipInGift: string,
	compInGift: string,
	supply: string,
): number => {
	const isComp = type === "compInGift";

	const currentCents = calculateAmountWithTax(currentValue, isComp);
	const otherCents = calculateAmountWithTax(
		isComp ? tipInGift : compInGift,
		!isComp,
	);
	const supplyCents = calculateAmountWithTax(supply, true);

	return currentCents + otherCents + supplyCents;
};

const calculateAvailableBalance = (
	balance: number,
	compInGift?: string,
	tipInGift?: string,
	supply?: string,
): number => {
	const compUsage = compInGift
		? roundCurrency(Number.parseFloat(compInGift) * TAX_RATE)
		: 0;
	const tipUsage = tipInGift ? roundCurrency(Number.parseFloat(tipInGift)) : 0;
	const supplyUsage = supply
		? roundCurrency(Number.parseFloat(supply) * TAX_RATE)
		: 0;

	return roundCurrency(balance - compUsage - tipUsage - supplyUsage);
};
