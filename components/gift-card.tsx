import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/utils";
import type { Gift, Transaction } from "@/utils/types";
import { GiftCardTransaction } from "./gift-card-transaction";

type Props = {
	giftCard: Gift;
};

export const GiftCard = ({ giftCard }: Props) => {
	const { isLight } = useAppTheme();

	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const snapPoints = useMemo(() => ["80%"], []);

	const handleSheetChanges = useCallback((index: number) => {
		setIsOpen(index >= 0);
	}, []);

	const openBottomSheet = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		bottomSheetRef.current?.present();
	}, []);

	const closeBottomSheet = useCallback(() => {
		bottomSheetRef.current?.dismiss();
	}, []);

	const deleteGiftCard = useMutation(api.giftCards.deleteGiftCard);

	const transactions = useQuery(
		api.transactions.listByGiftCard,
		isOpen ? { giftCardId: giftCard._id as Id<"giftCards"> } : "skip",
	);

	const balanceClassName = cn(
		"text-right font-semibold text-md",
		!isLight && "text-gray-300",
	);
	const textClassName = cn("text-base text-muted", !isLight && "text-gray-300");

	const totalUsed =
		transactions?.reduce(
			(sum, tx) => sum + (tx.compInGift || 0) + (tx.tipInGift || 0),
			0,
		) || 0;

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
							closeBottomSheet();
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
			<Pressable onPress={openBottomSheet}>
				<Animated.View
					key={giftCard._id}
					entering={FadeIn}
					exiting={FadeOut}
					className="flex-row items-center justify-between rounded-lg bg-gray-300 p-4 shadow-md dark:bg-gray-700"
				>
					<Text
						className={cn(
							"font-medium font-mono text-foreground text-md",
							!isLight && "text-gray-300",
						)}
					>
						{giftCard.code}
					</Text>
					<Text className={balanceClassName}>
						${giftCard.balance?.toFixed(2)}
					</Text>
				</Animated.View>
			</Pressable>

			<BottomSheetModal
				ref={bottomSheetRef}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				enablePanDownToClose
				backgroundStyle={{ backgroundColor: isLight ? "#fff" : "#1f2937" }}
				handleIndicatorStyle={{
					backgroundColor: isLight ? "#9ca3af" : "#6b7280",
				}}
			>
				<BottomSheetView className="flex-1 px-6 pb-6">
					<View className="mb-4 flex-row items-center justify-between">
						<View className="flex-1">
							<Text
								className={cn(
									"font-bold text-2xl text-foreground",
									!isLight && "text-gray-300",
								)}
							>
								Gift Card: {giftCard.code}
							</Text>
							<Text className={textClassName}>
								Sold on {formatCreationDate(giftCard.sellDate)}
							</Text>
						</View>
						<Pressable
							onPress={closeBottomSheet}
							className="rounded-full bg-background-secondary p-2"
						>
							<Ionicons
								name="close"
								size={24}
								color={isLight ? "#000" : "#fff"}
							/>
						</Pressable>
					</View>
					<View className="mb-4 gap-2 rounded-lg bg-gray-300 p-4 shadow-md dark:bg-gray-700">
						<View className="flex-row justify-between">
							<Text className={textClassName}>Owner:</Text>
							<Text
								className={cn(
									"font-semibold text-foreground",
									!isLight && "text-gray-300",
								)}
							>
								{giftCard.client || "-"}
							</Text>
						</View>
						<View className="flex-row justify-between">
							<Text className={textClassName}>Total Used:</Text>
							<Text
								className={cn(
									"font-semibold text-foreground",
									!isLight && "text-gray-300",
								)}
							>
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
								disabled={isDeleting}
								mode="contained"
								className="rounded-3xl"
								buttonColor="#ef4444"
								loading={isDeleting}
							>
								{isDeleting ? "Deleting..." : "Delete Gift Card"}
							</Button>
						</View>
					)}
				</BottomSheetView>
			</BottomSheetModal>
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
