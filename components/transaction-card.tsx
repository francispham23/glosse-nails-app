import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { cn } from "heroui-native";
import { Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { isToday } from "@/utils";
import type { Transaction } from "@/utils/types";

type Props = {
	transaction: Transaction;
	technicianId?: string;
};

export const TransactionCard = ({ transaction, technicianId }: Props) => {
	const { isLight } = useAppTheme();
	const className = cn("text-lg text-muted", !isLight && "-foreground");

	const { endOfDay } = useAppDate();
	const isSelectedDateToday = isToday(endOfDay.getTime());

	const showClient =
		transaction.client && transaction.client !== transaction.technician;

	const isLocalTransaction = transaction._id.startsWith("local_");

	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				// Don't allow editing local transactions that haven't been synced yet
				if (!isLocalTransaction) {
					router.navigate(`/transaction/${transaction._id}/edit`);
				}
			}}
			disabled={isLocalTransaction}
		>
			<Animated.View
				key={transaction._id}
				entering={FadeIn}
				exiting={FadeOut}
				className={cn(
					"gap-3 rounded-lg border-r-accent bg-background-secondary p-3",
					isLocalTransaction && "opacity-60",
				)}
			>
				{/* Render transaction details here */}
				{!technicianId ? (
					<Text className={className}>
						Technician: {transaction.technician}
					</Text>
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
						{getServiceDateString(transaction.serviceDate, isSelectedDateToday)}
					</Text>
				) : null}
				{isLocalTransaction ? (
					<Text className={cn(className, "text-xs italic")}>
						Not synced - Tap checkout to sync
					</Text>
				) : null}
			</Animated.View>
		</Pressable>
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
