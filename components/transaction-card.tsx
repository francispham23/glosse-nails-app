import { cn } from "heroui-native";
import { Text } from "react-native";
import { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import type { Transaction } from "@/utils/types";
import { Container } from "./container";

type Props = {
	transaction: Transaction;
	technicianId?: string;
};

export const TransactionCard = ({ transaction, technicianId }: Props) => {
	const { isLight } = useAppTheme();
	const className = cn("text-lg text-muted", !isLight && "-foreground");

	let date = "";
	if (transaction.serviceDate) {
		const time = new Date(transaction.serviceDate).toLocaleString();
		const dayInWeek = new Date(transaction.serviceDate).toLocaleDateString(
			"en-US",
			{
				weekday: "short",
			},
		);
		date = `${dayInWeek}, ${time}.`;
	}

	return (
		<Container
			key={transaction._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="flex-1 gap-3 rounded-lg border-r-accent bg-background-secondary p-3"
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
			{transaction.services && transaction.services.length > 0 ? (
				<Text className={className}>Services: {transaction.services}</Text>
			) : null}
			<Text className={className}>Date: {date}.</Text>
		</Container>
	);
};
