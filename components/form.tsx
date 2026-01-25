import { Text, View } from "react-native";
import type { Category, PaymentMethod } from "@/utils/types";

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

export const paymentMethods = [
	"Card",
	"Cash",
	"Gift Card",
	"Discount",
] as PaymentMethod[];

export const initialEarningState = {
	compensation: "",
	compInCash: "",
	compensationMethods: ["Card"] as PaymentMethod[],
	tip: "",
	tipInCash: "",
	tipMethods: ["Card"] as PaymentMethod[],
	discount: "",
	gift: "",
	giftCode: "",
	services: [] as Category["_id"][],
};
