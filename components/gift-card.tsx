import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Button, cn, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
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
	const background = useThemeColor("background");

	const [modalVisible, setModalVisible] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const deleteGiftCard = useMutation(api.giftCards.deleteGiftCard);

	const transactions = useQuery(
		api.transactions.listByGiftCard,
		modalVisible ? { giftCardId: giftCard._id as Id<"giftCards"> } : "skip",
	);

	const balanceClassName = cn(
		"text-right font-semibold text-md",
		(giftCard.balance ?? 0) > 0 ? "text-success" : "text-foreground",
	);
	const textClassName = cn("text-base text-muted", !isLight && "-foreground");

	const totalUsed =
		transactions?.reduce((sum, tx) => sum + (tx.gift || 0), 0) || 0;

	const isUnused = giftCard.transactionIds.length === 0;

	const handleDelete = async () => {
		if (!isUnused) {
			Alert.alert(
				"Cannot Delete",
				"Only unused gift cards can be deleted. This gift card has been used.",
			);
			return;
		}

		Alert.alert(
			"Delete Gift Card",
			`Are you sure you want to delete gift card ${giftCard.code}? This action cannot be undone.`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);
							await deleteGiftCard({
								id: giftCard._id as Id<"giftCards">,
							});
							setModalVisible(false);
							Alert.alert("Success", "Gift card deleted successfully");
						} catch (error) {
							Alert.alert(
								"Error",
								error instanceof Error
									? error.message
									: "Failed to delete gift card",
							);
							console.error("Failed to delete gift card:", error);
						} finally {
							setIsDeleting(false);
						}
					},
				},
			],
		);
	};

	return (
		<>
			<Pressable
				onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					setModalVisible(true);
				}}
			>
				<Animated.View
					key={giftCard._id}
					entering={FadeIn}
					exiting={FadeOut}
					className="flex-row items-center justify-between rounded-lg bg-background-secondary px-4 py-3"
				>
					<Text className="font-medium font-mono text-foreground text-md">
						{giftCard.code}
					</Text>
					<Text className={balanceClassName}>
						${giftCard.balance?.toFixed(2)}
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
								<Text className={textClassName}>
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
								<Text className={textClassName}>Owner:</Text>
								<Text className="font-semibold text-foreground">
									{giftCard.client || "-"}
								</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className={textClassName}>Total Used:</Text>
								<Text className="font-semibold text-foreground">
									${totalUsed.toFixed(2)}
								</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className={textClassName}>Current Balance:</Text>
								<Text className={balanceClassName}>
									${giftCard.balance?.toFixed(2)}
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
									<Text className={textClassName}>
										No transactions found for this gift card
									</Text>
								</View>
							}
						/>
						{isUnused && (
							<View className="mt-4">
								<Button
									onPress={handleDelete}
									isDisabled={isDeleting}
									size="lg"
									className="rounded-3xl"
									variant="destructive"
								>
									<Button.Label>
										{isDeleting ? "Deleting..." : "Delete Gift Card"}
									</Button.Label>
									{isDeleting ? <Spinner color={background} /> : null}
								</Button>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</>
	);
};

const formatCreationDate = (timestamp: number) => {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};
