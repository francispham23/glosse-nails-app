import { useEffect } from "react";
import { Text } from "react-native";
import { TextInput } from "react-native-paper";

import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";
import type { EarningFormState, Gift } from "@/utils/types";
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
	const { giftCode, tipInGift, compInGift, supply } = earning;

	const availableBalance = giftCard?.balance
		? calculateAvailableBalance(giftCard.balance, compInGift, supply)
		: 0;

	useEffect(() => {
		if (giftCard && availableBalance < 0) {
			setGiftError(
				`Gift card balance insufficient. Available: $${availableBalance.toFixed(2)}`,
			);
		} else {
			setGiftError("");
		}
	}, [availableBalance, giftCard, setGiftError]);

	if (!type) return null;

	const handleCodeChange = (value: string) => {
		updateEarning("giftCode", value);
		setGiftError("");
	};

	const handleAmountChange = (value: string) => {
		updateEarning(type, value);
		if (!giftCard) return;

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
						placeholder="Enter amount from Gift Card"
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
	supply?: string,
): number => {
	const compUsage = compInGift
		? roundCurrency(Number.parseFloat(compInGift) * TAX_RATE)
		: 0;
	const supplyUsage = supply
		? roundCurrency(Number.parseFloat(supply) * TAX_RATE)
		: 0;
	return roundCurrency(balance - compUsage - supplyUsage);
};
