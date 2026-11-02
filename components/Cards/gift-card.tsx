import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Text as PaperText, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import {
	Amount,
	OverviewCard,
	RowIndicator,
} from "@/components/workspace/card";
import { workspaceStyles } from "@/components/workspace/screen";

import { useAppTheme } from "@/contexts/app-theme-context";
import { cn, type Gift } from "@/utils";
import { BottomModal } from "../Gift/bottom-modal";

type Props = {
	overview?: boolean;
	giftCard: Gift;
	isAuthorized: boolean;
};

export const GiftCard = ({
	giftCard,
	isAuthorized,
	overview = false,
}: Props) => {
	const { isLight } = useAppTheme();
	const { colors } = useTheme();
	const bottomSheetRef = useRef<BottomSheetModal | null>(null);

	const openBottomSheet = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		bottomSheetRef.current?.present();
	}, []);

	const closeBottomSheet = useCallback(() => {
		bottomSheetRef.current?.dismiss();
	}, []);

	const balanceClassName = cn(
		"text-right font-semibold text-foreground text-md",
	);

	return (
		<>
			{overview ? (
				<OverviewCard
					label={`Gift card ${giftCard.code}, balance $${giftCard.balance?.toFixed(2)}`}
					onPress={openBottomSheet}
				>
					<View style={workspaceStyles.row}>
						<View style={workspaceStyles.name}>
							<PaperText style={{ fontWeight: "600", fontSize: 16 }}>
								{giftCard.code}
							</PaperText>
							<PaperText
								style={{
									color:
										giftCard.balance === 0
											? colors.onSurfaceVariant
											: colors.secondary,
									fontSize: 12,
								}}
							>
								{giftCard.balance === 0
									? "Fully redeemed"
									: "Available balance"}
							</PaperText>
						</View>
						<Amount
							label="Balance"
							value={`$${giftCard.balance?.toFixed(2)}`}
						/>
						<RowIndicator />
					</View>
				</OverviewCard>
			) : (
				<Pressable onPress={openBottomSheet}>
					<Animated.View
						key={giftCard._id}
						className="flex-row items-center justify-between rounded-lg bg-background-secondary p-4 shadow-md"
					>
						<Text
							className={cn("font-medium font-mono text-foreground text-md")}
						>
							{giftCard.code}
						</Text>
						<Text className={balanceClassName}>
							${giftCard.balance?.toFixed(2)}
						</Text>
					</Animated.View>
				</Pressable>
			)}

			<BottomModal
				giftCard={giftCard}
				isLight={isLight}
				isAuthorized={isAuthorized}
				bottomSheetRef={bottomSheetRef}
				closeBottomSheet={closeBottomSheet}
			/>
		</>
	);
};
