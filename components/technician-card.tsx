import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import type { User } from "@/utils/types";

interface Props {
	item: User;
}

export const TechnicianCard = ({ item }: Props) => {
	const { isLight } = useAppTheme();
	const router = useRouter();

	const className = cn(
		"min-w-[50] text-right text-lg text-muted",
		!isLight && "-foreground",
	);

	const createSpeakerTapGesture = (item: User) =>
		Gesture.Tap()
			.maxDistance(10)
			.runOnJS(true)
			.onEnd(() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				router.navigate(`/technician/${item._id}/form`);
			});

	return (
		<Animated.View
			key={item._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="flex-row justify-between rounded-lg border-r-accent bg-background-secondary p-2"
		>
			<GestureDetector key={item._id} gesture={createSpeakerTapGesture(item)}>
				<View className="w-full flex-row justify-between">
					<Text className={className}>{item.name ?? "Unknown"}</Text>
					<View className="flex-row justify-between gap-6">
						<Text className={className}>${item.compensation}</Text>
						<Text className={className}>${item.tip}</Text>
					</View>
				</View>
			</GestureDetector>
		</Animated.View>
	);
};
