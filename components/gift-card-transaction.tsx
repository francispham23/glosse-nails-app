import { cn } from "heroui-native";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAppTheme } from "@/contexts/app-theme-context";
import type { Transaction } from "@/utils/types";

type Props = {
	transaction: Transaction;
};

export const GiftCardTransaction = ({ transaction }: Props) => {
	const { isLight } = useAppTheme();
	const textClassName = cn("text-base text-muted", !isLight && "-foreground");

	return (
		<Animated.View
			key={transaction._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="gap-2 rounded-lg bg-background-secondary p-3"
		>
			<View className="flex-row items-center justify-between">
				<Text className="font-semibold text-foreground text-lg">
					${transaction.gift?.toFixed(2) || "0.00"} Used
				</Text>
				<Text className={cn(textClassName, "text-xs")}>
					{formatDate(transaction.serviceDate)}
				</Text>
			</View>
			<Text className={textClassName}>
				Technician: {transaction.technician}
			</Text>
			{transaction.client && transaction.client !== "Unknown" ? (
				<Text className={textClassName}>Client: {transaction.client}</Text>
			) : null}
		</Animated.View>
	);
};

const formatDate = (timestamp: number | undefined) => {
	if (!timestamp) return "Unknown";
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
};
