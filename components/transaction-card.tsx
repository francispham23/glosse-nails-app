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

	return (
		<Container
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
			{!technicianId ? (
				<Text className={className}>Technician: {transaction.technician}</Text>
			) : (
				<Text className={className}>Services: {transaction.services}</Text>
			)}
			<Text className={className}>
				Service Date: {new Date(transaction.serviceDate).toDateString()}
			</Text>
		</Container>
	);
};
