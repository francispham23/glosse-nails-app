import { cn } from "heroui-native";
import { Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import type { Transaction } from "@/utils/types";

type Props = {
	transaction: Transaction;
};

export const TransactionCard = ({ transaction }: Props) => {
	const { isLight } = useAppTheme();
	const className = cn("text-lg text-muted", !isLight && "-foreground");

	return (
		<Animated.View
			key={transaction._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="flex-1 gap-3 rounded-lg border-r-accent bg-background-secondary p-3"
		>
			{/* Render transaction details here */}
			<Text className={className}>Client: {transaction.client}</Text>
			<Text className={className}>
				Compensation: ${transaction.compensation}
			</Text>
			<Text className={className}>Tip: ${transaction.tip}</Text>
			{transaction.technician ? (
				<Text className={className}>Technician: {transaction.technician}</Text>
			) : null}
			<Text className={className}>
				Transaction ID: {transaction._id.toString()}
			</Text>
		</Animated.View>
	);
};
