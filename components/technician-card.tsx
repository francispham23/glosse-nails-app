import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { User } from "@/utils/types";

interface Props {
	item: User;
	report?: boolean;
	isSelecting?: boolean;
	isSelected?: boolean;
	onToggleSelect?: (user: User) => void;
}

export const TechnicianCard = ({
	item,
	report,
	isSelecting = false,
	isSelected = false,
	onToggleSelect,
}: Props) => {
	const { isLight } = useAppTheme();
	const router = useRouter();

	const technician = useQuery(api.users.getUserById, {
		userId: item._id,
	});
	const technicianClassName = cn(
		"min-w-[50] text-left text-lg text-muted",
		!isLight && "-foreground",
	);

	const className = cn(
		"w-[100] text-right text-lg text-muted",
		!isLight && "-foreground",
	);

	const createSpeakerTapGesture = (item: User) =>
		Gesture.Tap()
			.maxDistance(10)
			.runOnJS(true)
			.onEnd(() => {
				if (report) return;
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				if (isSelecting && onToggleSelect) {
					onToggleSelect(item);
				} else {
					router.navigate(`/technician/${item._id}/create`);
				}
			});

	return (
		<Animated.View
			key={item._id}
			entering={FadeIn}
			exiting={FadeOut}
			className={cn(
				"flex-row justify-between rounded-lg border-r-accent bg-background-secondary p-2",
				isSelecting && isSelected && "border border-primary",
			)}
		>
			<GestureDetector key={item._id} gesture={createSpeakerTapGesture(item)}>
				<View className="w-full flex-row justify-between">
					<Text className={technicianClassName}>
						{technician?.name ?? "Unknown"}
					</Text>
					<View className="flex-row justify-between gap-6">
						<Text className={className}>${item.compensation}</Text>
						<Text className={className}>${item.tip}</Text>
					</View>
				</View>
			</GestureDetector>
		</Animated.View>
	);
};
