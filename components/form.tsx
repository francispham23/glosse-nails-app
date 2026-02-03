import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";

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
	return (
		<View className="gap-2">
			<Text className="font-extrabold text-4xl text-foreground">{title}</Text>
			<Text className="text-muted-foreground">{description}</Text>
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
	setEarning: React.Dispatch<React.SetStateAction<EarningFormState>>;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	giftCard?: Gift | null;
	type?: "tipInGift" | "compInGift";
};

export const GiftCardInputs = ({
	earning,
	setEarning,
	giftCard,
	giftError,
	setGiftError,
	type,
}: GiftCardInputsType) => {
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
					setEarning({ ...earning, giftCode: value });
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
				<Text className="px-4 text-foreground text-sm">
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
					setEarning({ ...earning, [type]: value });
					const giftAmount = Number.parseFloat(value || "0");
					if (giftCard && giftAmount > (giftCard.balance ?? 0)) {
						setGiftError(
							`Gift card balance insufficient. Available: $${giftCard.balance?.toFixed(2)}`,
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
export const otherInputs = ["Tip", "Discount", "Supply"];
