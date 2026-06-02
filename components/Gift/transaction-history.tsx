import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { cn, type Transaction } from "@/utils";
import { GiftCardTransaction } from "../Gift/gift-card-transaction";

type Props = {
	transactions: Transaction[];
	textClassName: string;
	isLight: boolean;
};

export const TransactionHistory = ({
	transactions,
	textClassName,
	isLight,
}: Props) => {
	return (
		<View className="max-h-[50%] flex-1">
			<Text
				className={cn(
					"mb-2 font-semibold text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				Transaction History
			</Text>
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-3"
				data={transactions}
				renderItem={({ item }: { item: Transaction }) => (
					<GiftCardTransaction
						key={item._id}
						transaction={item}
						isLight={isLight}
					/>
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={
					<View className="items-center justify-center py-8">
						<Text className={textClassName}>
							No transactions found for this gift card
						</Text>
					</View>
				}
			/>
		</View>
	);
};
