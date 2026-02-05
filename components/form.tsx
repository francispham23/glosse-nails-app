import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";
import type {
	Category,
	EarningFormState,
	Gift,
	PaymentMethod,
} from "@/utils/types";

/* ----------------------------- form container ----------------------------- */
export function FormContainer({ children }: { children: React.ReactNode }) {
	/**
	 * reason for this FormContainer is to later add keyboard avoiding view
	 * to the form
	 *
	 * i think maybe that would be a good idea??
	 */
	return <View className="flex-1 gap-4 px-6 pt-20">{children}</View>;
}

/* ------------------------------- form header ------------------------------ */
export default function FormHeader({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	const { isLight } = useAppTheme();

	return (
		<View className="gap-2">
			<Text
				className={cn(
					"font-extrabold text-4xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				{title}
			</Text>
			<Text
				className={cn("text-muted-foreground", !isLight && "text-gray-400")}
			>
				{description}
			</Text>
			{children}
		</View>
	);
}

/* ---------------------------- earning form state --------------------------- */
export const paymentMethods = ["Card", "Cash", "Gift Card"] as PaymentMethod[];

export const initialEarningState = {
	compensation: "",
	compInCash: "",
	compInGift: "",
	compensationMethods: ["Card"] as PaymentMethod[],
	tip: "0",
	tipInCash: "",
	tipInGift: "",
	tipMethods: ["Card"] as PaymentMethod[],
	discount: "",
	supply: "",
	giftCode: "",
	services: [] as Category["_id"][],
};

/* ---------------------------- gift card inputs --------------------------- */
type GiftCardInputsType = {
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

export const GiftCardInputs = ({
	earning,
	updateEarning,
	giftCard,
	giftError,
	setGiftError,
	type,
}: GiftCardInputsType) => {
	const { isLight } = useAppTheme();

	if (!type) return null;

	return (
		<>
			<TextInput
				mode="outlined"
				placeholder="Enter Gift Card Code"
				keyboardType="numeric"
				autoCapitalize="none"
				value={earning.giftCode?.toString()}
				onChangeText={(value) => {
					updateEarning("giftCode", value);
					setGiftError("");
				}}
				left={<TextInput.Icon icon="barcode" />}
				className="h-16 rounded-3xl"
			/>
			{earning.giftCode && giftCard === null && (
				<Text className="px-4 text-red-500 text-sm">
					Gift card code not found
				</Text>
			)}
			{giftCard && (
				<Text
					className={cn(
						"px-4 text-foreground text-sm",
						!isLight && "text-gray-300",
					)}
				>
					Available balance: ${giftCard.balance?.toFixed(2) ?? "0.00"}
				</Text>
			)}
			<TextInput
				mode="outlined"
				placeholder="Enter amount from Gift Card"
				keyboardType="numeric"
				autoCapitalize="none"
				value={earning[type as keyof EarningFormState]?.toString()}
				onChangeText={(value) => {
					updateEarning(type, value);

					if (!giftCard) return;

					const currentAmount = Number.parseFloat(value || "0");
					const otherAmount =
						type === "compInGift"
							? Number.parseFloat(earning.tipInGift || "0")
							: Number.parseFloat(earning.compInGift || "0");
					const totalGiftUsage = currentAmount + otherAmount;
					const balance = giftCard.balance ?? 0;

					if (totalGiftUsage > balance) {
						setGiftError(
							`Gift card balance insufficient. Total usage: $${totalGiftUsage.toFixed(2)}, Available: $${balance.toFixed(2)}`,
						);
					} else {
						setGiftError("");
					}
				}}
				left={<TextInput.Icon icon="wallet-giftcard" />}
				className="h-16 rounded-3xl"
			/>
			{giftError && (
				<Text className="px-4 text-red-500 text-sm">{giftError}</Text>
			)}
		</>
	);
};

/* --------------------------- other inputs --------------------------- */
export const otherInputs = ["Supply", "Discount"];
