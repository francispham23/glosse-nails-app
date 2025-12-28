import { cn } from "heroui-native";
import { Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import type { Transaction } from "@/utils/types";

type Props = {
	transaction: Transaction;
	technicianId?: string;
};

export const TransactionCard = ({ transaction, technicianId }: Props) => {
	const { isLight } = useAppTheme();
	const className = cn("text-lg text-muted", !isLight && "-foreground");

	return (
		<Animated.View
			key={transaction._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="gap-3 rounded-lg border-r-accent bg-background-secondary p-3"
		>
			{/* Render transaction details here */}
			{!technicianId ? (
				<Text className={className}>Technician: {transaction.technician}</Text>
			) : null}
			<Text className={className}>
				Compensation: ${transaction.compensation}
			</Text>
			<Text className={className}>Tip: ${transaction.tip}</Text>
			<Text className={className}>Client: {transaction.client}</Text>
			{transaction.services ? (
				<Text className={className}>Services: {transaction.services}</Text>
			) : null}
			{transaction.serviceDate ? (
				<Text className={className}>
					{getServiceDateString(transaction.serviceDate, true)}
				</Text>
			) : null}
		</Animated.View>
	);
};

const getServiceDateString = (
	timestamp: number | undefined,
	isCurrent: boolean,
) => {
	if (!timestamp) return "";
	const time = new Date(timestamp).toLocaleString();
	const dayInWeek = new Date(timestamp).toLocaleDateString("en-US", {
		weekday: "short",
	});
	if (isCurrent) {
		return `At: ${time.split(", ")[1]}.`;
	}
	return `Date: ${dayInWeek}, ${time}.`;
};
