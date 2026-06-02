import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { api } from "@/convex/_generated/api";

import { cn, type Gift, getErrorMessage } from "@/utils";
import { TAX_RATE } from "../Form/constants";
import { TransactionHistory } from "./transaction-history";

type Props = {
	giftCard: Gift;
	isLight: boolean;
	isAuthorized: boolean;
	bottomSheetRef: React.RefObject<BottomSheetModal | null>;
	closeBottomSheet: () => void;
};
export const BottomModal = ({
	giftCard,
	isLight,
	isAuthorized,
	bottomSheetRef,
	closeBottomSheet,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const transactions = useQuery(
		api.transactions.listByGiftCard,
		isOpen ? { giftCardId: giftCard._id as Gift["_id"] } : "skip",
	);
	const deleteGiftCard = useMutation(api.giftCards.deleteGiftCard);

	const snapPoints = useMemo(() => ["80%"], []);

	const handleSheetChanges = useCallback((index: number) => {
		setIsOpen(index >= 0);
	}, []);

	const totalUsed =
		transactions?.reduce(
			(sum, tx) =>
				sum +
				(tx.compInGift ?? 0) * TAX_RATE +
				(tx.supply ?? 0) * TAX_RATE +
				(tx.tipInGift ?? 0),
			0,
		) || 0;

	const isUnused = giftCard.transactionIds.length === 0 || totalUsed === 0;

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
								id: giftCard._id as Gift["_id"],
							});
							closeBottomSheet();
							Alert.alert("Success", "Gift card deleted successfully");
						} catch (error) {
							Alert.alert(
								"Error",
								getErrorMessage(error, "Failed to delete gift card"),
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

	const balanceClassName = cn(
		"text-right font-semibold text-md",
		!isLight && "text-gray-300",
	);
	const textClassName = cn("text-base text-muted", !isLight && "text-gray-300");

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: isLight ? "#fff" : "#1f2937" }}
			handleIndicatorStyle={{
				backgroundColor: isLight ? "#2d2e31" : "#6b7280",
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
				{transactions ? (
					<TransactionHistory
						transactions={transactions}
						textClassName={textClassName}
						isLight={isLight}
					/>
				) : null}
				{isUnused && isAuthorized ? (
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
				) : null}
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export const formatCreationDate = (timestamp: number) => {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
};
