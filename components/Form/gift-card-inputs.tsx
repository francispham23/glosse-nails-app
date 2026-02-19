import { Text } from "react-native";
import { TextInput } from "react-native-paper";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";
import type { EarningFormState, Gift } from "@/utils/types";
import { TAX_RATE } from "./constants";
import { formatCurrency, roundCurrency, toCents } from "./helpers";

type GiftCardInputsProps = {
	earning: EarningFormState;
	updateEarning: <K extends keyof EarningFormState>(
		key: K,
		value: EarningFormState[K],
	) => void;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	giftCard?: Gift | null;
	type?: "tipInGift" | "compInGift";
};

type GiftType = "tipInGift" | "compInGift";

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
): number => {
	const isComp = type === "compInGift";

	const currentCents = calculateAmountWithTax(currentValue, isComp);
	const otherCents = calculateAmountWithTax(
		isComp ? tipInGift : compInGift,
		!isComp,
	);

	return currentCents + otherCents;
};

const calculateAvailableBalance = (
	balance: number,
	compInGift?: string,
): number => {
	const compUsage = compInGift
		? roundCurrency(Number.parseFloat(compInGift) * TAX_RATE)
		: 0;
	return roundCurrency(balance - compUsage);
};

/* ----------------------------- Sub-Components ----------------------------- */

const GiftCodeInput = ({
	value,
	onChange,
}: {
	value?: string;
	onChange: (value: string) => void;
}) => (
	<TextInput
		mode="outlined"
		placeholder="Enter Gift Card Code"
		keyboardType="numeric"
		autoCapitalize="none"
		value={value}
		onChangeText={onChange}
		left={<TextInput.Icon icon="barcode" />}
		className="h-16 rounded-3xl"
	/>
);

const GiftAmountInput = ({
	value,
	onChange,
}: {
	value?: string;
	onChange: (value: string) => void;
}) => (
	<TextInput
		mode="outlined"
		placeholder="Enter amount from Gift Card"
		keyboardType="numeric"
		autoCapitalize="none"
		value={value}
		onChangeText={onChange}
		left={<TextInput.Icon icon="wallet-giftcard" />}
		className="h-16 rounded-3xl"
	/>
);

const ErrorText = ({ message }: { message: string }) => (
	<Text className="px-4 text-red-500 text-sm">{message}</Text>
);

/* ----------------------------- Main Component ----------------------------- */

export const GiftCardInputs = ({
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	type,
}: GiftCardInputsProps) => {
	const { isLight } = useAppTheme();
	const { giftCode, tipInGift, compInGift } = earning;

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
	const availableBalance = giftCard?.balance
		? calculateAvailableBalance(giftCard.balance, compInGift)
		: 0;

	return (
		<>
			<GiftCodeInput value={giftCode} onChange={handleCodeChange} />

			{showNotFoundError && <ErrorText message="Gift card code not found" />}

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
					<GiftAmountInput
						value={earning[type]?.toString()}
						onChange={handleAmountChange}
					/>
				</>
			)}

			{giftError && <ErrorText message={giftError} />}
		</>
	);
};
