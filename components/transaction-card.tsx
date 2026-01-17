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

	const showClient =
		transaction.client && transaction.client !== transaction.technician;

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
			{showClient ? (
				<Text className={className}>Client: {transaction.client}</Text>
			) : null}
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
	const date = new Date(timestamp);
	const time = date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	const dayInWeek = date.toLocaleDateString("en-US", {
		weekday: "short",
	});
	if (isCurrent) {
		return `At: ${time}.`;
	}
	const fullDate = date.toLocaleDateString("en-US");
	return `Date: ${dayInWeek}, ${fullDate} ${time}.`;
};
