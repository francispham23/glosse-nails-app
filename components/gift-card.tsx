import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { cn } from "heroui-native";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Gift, Transaction } from "@/utils/types";
import { GiftCardTransaction } from "./gift-card-transaction";

type Props = {
	giftCard: Gift;
};

export const GiftCard = ({ giftCard }: Props) => {
	const { isLight } = useAppTheme();
	const [modalVisible, setModalVisible] = useState(false);

	const transactions = useQuery(
		api.transactions.listByGiftCard,
		modalVisible ? { giftCardId: giftCard._id as Id<"giftCards"> } : "skip",
	);

	const balanceClassName = cn(
		"text-right font-semibold text-lg",
		giftCard.balance > 0 ? "text-success" : "text-muted-foreground",
	);

	const formatCreationDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const totalUsed =
		transactions?.reduce((sum, tx) => sum + (tx.gift || 0), 0) || 0;

	return (
		<>
			<Pressable onPress={() => setModalVisible(true)}>
				<Animated.View
					key={giftCard._id}
					entering={FadeIn}
					exiting={FadeOut}
					className="flex-row items-center justify-between rounded-lg bg-background-secondary px-4 py-3"
				>
					<Text className="font-medium font-mono text-foreground text-lg">
						{giftCard.code}
					</Text>
					<Text className={balanceClassName}>
						${giftCard.balance.toFixed(2)}
					</Text>
				</Animated.View>
			</Pressable>

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 justify-end">
					<Pressable
						className="flex-1"
						onPress={() => setModalVisible(false)}
					/>
					<View className="max-h-[80%] rounded-t-3xl bg-background p-6 shadow-lg">
						<View className="mb-4 flex-row items-center justify-between">
							<View className="flex-1">
								<Text className="font-bold text-2xl text-foreground">
									Gift Card: {giftCard.code}
								</Text>
								<Text className="text-muted-foreground">
									Created on {formatCreationDate(giftCard._creationTime)}
								</Text>
							</View>
							<Pressable
								onPress={() => setModalVisible(false)}
								className="rounded-full bg-background-secondary p-2"
							>
								<Ionicons
									name="close"
									size={24}
									color={isLight ? "#000" : "#fff"}
								/>
							</Pressable>
						</View>

						<View className="mb-4 gap-2 rounded-lg bg-background-secondary p-4">
							<View className="flex-row justify-between">
								<Text className="text-muted-foreground">Owner:</Text>
								<Text className="font-semibold text-foreground">
									{giftCard.client || "-"}
								</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className="text-muted-foreground">Total Used:</Text>
								<Text className="font-semibold text-foreground">
									${totalUsed.toFixed(2)}
								</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className="text-muted-foreground">Current Balance:</Text>
								<Text className={balanceClassName}>
									${giftCard.balance.toFixed(2)}
								</Text>
							</View>
						</View>

						<Text className="mb-2 font-semibold text-foreground">
							Transaction History
						</Text>
						<Animated.FlatList
							contentInsetAdjustmentBehavior="automatic"
							contentContainerClassName="gap-3"
							data={transactions}
							renderItem={({ item }: { item: Transaction }) => (
								<GiftCardTransaction key={item._id} transaction={item} />
							)}
							keyExtractor={(item) => item._id.toString()}
							ListEmptyComponent={
								<View className="items-center justify-center py-8">
									<Text className="text-muted-foreground">
										No transactions found for this gift card
									</Text>
								</View>
							}
						/>
					</View>
				</View>
			</Modal>
		</>
	);
};
