import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { api } from "@/convex/_generated/api";

import { cn, type Gift } from "@/utils";
import { DeleteButton } from "../Buttons/delete-button";
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
	const { colors } = useTheme();
	const [isOpen, setIsOpen] = useState(false);

	const transactions = useQuery(
		api.transactions.listByGiftCard,
		isOpen ? { giftCardId: giftCard._id as Gift["_id"] } : "skip",
	);

	const snapPoints = useMemo(() => ["80%"], []);

	const handleSheetChanges = useCallback((index: number) => {
		setIsOpen(index >= 0);
	}, []);

	// History can be self-only; the shared balance covers every redemption.
	const totalUsed =
		giftCard.balance === undefined ? null : giftCard.value - giftCard.balance;

	const isUnused = giftCard.transactionIds.length === 0 && totalUsed === 0;

	const balanceClassName = cn(
		"text-right font-semibold text-foreground text-md",
	);
	const textClassName = cn("text-base text-muted");

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			onChange={handleSheetChanges}
			enablePanDownToClose
			backgroundStyle={{ backgroundColor: colors.surface }}
			handleIndicatorStyle={{
				backgroundColor: colors.onSurfaceVariant,
			}}
		>
			<BottomSheetView className="flex-1 px-6 pb-6">
				<View className="mb-4 flex-row items-center justify-between">
					<View className="flex-1">
						<Text className={cn("font-bold text-2xl text-foreground")}>
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
						<Ionicons name="close" size={24} color={colors.onSurface} />
					</Pressable>
				</View>
				<View className="mb-4 gap-2 rounded-lg bg-background-secondary p-4 shadow-md">
					<View className="flex-row justify-between">
						<Text className={textClassName}>Owner:</Text>
						<Text className={cn("font-semibold text-foreground")}>
							{giftCard.client || "-"}
						</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className={textClassName}>Total Used:</Text>
						<Text className={cn("font-semibold text-foreground")}>
							{totalUsed === null ? "—" : `$${totalUsed.toFixed(2)}`}
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
						title={
							isAuthorized ? "Transaction History" : "Your Transaction History"
						}
						transactions={transactions}
						textClassName={textClassName}
						isLight={isLight}
					/>
				) : null}
				{isUnused && isAuthorized ? (
					<DeleteButton type="giftCards" id={giftCard._id} />
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
