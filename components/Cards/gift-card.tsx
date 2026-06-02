import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Pressable, Text } from "react-native";
import Animated from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { cn, type Gift } from "@/utils";
import { BottomModal } from "../Gift/bottom-modal";

type Props = {
	giftCard: Gift;
	isAuthorized: boolean;
};

export const GiftCard = ({ giftCard, isAuthorized }: Props) => {
	const { isLight } = useAppTheme();
	const bottomSheetRef = useRef<BottomSheetModal | null>(null);

	const openBottomSheet = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		bottomSheetRef.current?.present();
	}, []);

	const closeBottomSheet = useCallback(() => {
		bottomSheetRef.current?.dismiss();
	}, []);

	const balanceClassName = cn(
		"text-right font-semibold text-md",
		!isLight && "text-gray-300",
	);

	return (
		<>
			<Pressable onPress={openBottomSheet}>
				<Animated.View
					key={giftCard._id}
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
