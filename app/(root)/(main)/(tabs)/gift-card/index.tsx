import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { AddButton } from "@/components/Buttons/add-button";
import { GiftCard } from "@/components/gift-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";
import type { Gift as GiftType } from "@/utils/types";

export default function GiftCardRoute() {
	const router = useRouter();
	const { isLight } = useAppTheme();
	const giftCards = useQuery(api.giftCards.list);

	const createSpeakerTapGesture = () =>
		Gesture.Tap()
			.maxDistance(10)
			.runOnJS(true)
			.onEnd(() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				router.navigate("/gift/create");
			});

	const className = cn(
		"min-w-[50] text-right font-bold text-lg",
		!isLight && "text-gray-300",
	);

	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<View className="flex-row justify-between gap-2 px-5 pt-45 pb-4">
				<Text className={className}>Gift Card Code</Text>
				<View className="min-w-[50] flex-row justify-between gap-6">
					<Text className={cn("w-[50]", className)}>Value</Text>
				</View>
			</View>

			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 px-4 pb-24"
				entering={FadeIn}
				exiting={FadeOut}
				data={giftCards}
				renderItem={({ item }: { item: GiftType }) => (
					<GiftCard giftCard={item} />
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={<ListEmptyComponent item="gift card" />}
			/>
			<GestureDetector gesture={createSpeakerTapGesture()}>
				<View className="absolute bottom-25 self-center">
					<AddButton />
				</View>
			</GestureDetector>
		</Animated.View>
	);
}
