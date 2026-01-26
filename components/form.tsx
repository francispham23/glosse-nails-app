import { Ionicons } from "@expo/vector-icons";
import { TextField, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

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
	compensationMethods: ["Card"] as PaymentMethod[],
	tip: "",
	tipInCash: "",
	tipMethods: ["Card"] as PaymentMethod[],
	discount: "",
	supply: "",
	gift: "",
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
};

// TODO: Separate compensation and tip gift card inputs?
export const GiftCardInputs = ({
	earning,
	setEarning,
	giftCard,
	giftError,
	setGiftError,
}: GiftCardInputsType) => {
	const mutedColor = useThemeColor("muted");

	return (
		<>
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter Gift Card Code"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.giftCode?.toString()}
					onChangeText={(value) => {
						setEarning({ ...earning, giftCode: value });
						setGiftError("");
					}}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="code-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{earning.giftCode && giftCard === null && (
				<Text className="px-4 text-red-500 text-sm">
					Gift card code not found
				</Text>
			)}
			{giftCard && (
				<Text className="px-4 text-foreground text-sm">
					Available balance: ${giftCard.balance.toFixed(2)}
				</Text>
			)}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter amount from Gift Card"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.gift?.toString()}
					onChangeText={(value) => {
						setEarning({ ...earning, gift: value });
						const giftAmount = Number.parseFloat(value || "0");
						if (giftCard && giftAmount > giftCard.balance) {
							setGiftError(
								`Gift card balance insufficient. Available: $${giftCard.balance.toFixed(2)}`,
							);
						} else {
							setGiftError("");
						}
					}}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{giftError && (
				<Text className="px-4 text-red-500 text-sm">{giftError}</Text>
			)}
		</>
	);
};

/* --------------------------- other inputs --------------------------- */
export const otherInputs = ["Tip", "Discount", "Supply"];
