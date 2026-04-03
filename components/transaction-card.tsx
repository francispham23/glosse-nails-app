import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn, isToday, type Transaction } from "@/utils";

type Props = {
	transaction: Transaction;
	isAuthorized?: boolean;
	technicianId?: string;
	userName?: string;
};

export const TransactionCard = ({
	transaction,
	technicianId,
	isAuthorized,
	userName,
}: Props) => {
	const { isLight } = useAppTheme();
	const { endOfDay } = useAppDate();
	const className = cn("text-lg text-muted", !isLight && "text-gray-300");

	const isSelectedDateToday = isToday(endOfDay.getTime());
	const showClient =
		transaction.client && transaction.client !== transaction.technician;
	const isDisabled = !isAuthorized && transaction.technician !== userName;
	return (
		<Pressable
			onPress={() => {
				if (!isAuthorized && transaction.technician !== userName) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
					return;
				}
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				router.navigate(`/transaction/${transaction._id}/edit`);
			}}
			disabled={isDisabled}
		>
			<Animated.View
				key={transaction._id}
				entering={FadeIn}
				exiting={FadeOut}
				className={cn(
					"gap-3 rounded-lg border-r-accent bg-gray-300 p-3 shadow-md dark:bg-gray-700",
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
