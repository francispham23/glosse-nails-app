import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { cn, formatDate, type Transaction } from "@/utils";
import { giftUsageCents } from "@/utils/money";

type Props = {
	transaction: Transaction;
	isLight: boolean;
};

export const GiftCardTransaction = ({ transaction }: Props) => {
	const textClassName = cn("text-base text-muted");

	return (
		<Animated.View
			key={transaction._id}
			entering={FadeIn}
			exiting={FadeOut}
			className={cn("gap-2 rounded-lg bg-background-secondary p-3 shadow-md")}
		>
			<View className="flex-row items-center justify-between">
				<Text className={cn("font-semibold text-foreground text-lg")}>
					${(giftUsageCents(transaction) / 100).toFixed(2)} Used
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
