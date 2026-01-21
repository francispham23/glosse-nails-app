import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
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
		"text-right text-lg text-muted",
		!isLight && "-foreground",
	);

	return (
		<Pressable
			onPress={() => {
				if (report) return;
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				if (isSelecting && onToggleSelect) {
					onToggleSelect(item);
				} else {
					router.navigate(`/technician/${item._id}/create`);
				}
			}}
		>
			<Animated.View
				key={item._id}
				entering={FadeIn}
				exiting={FadeOut}
				className={cn(
					"flex-row justify-between rounded-lg border-r-accent bg-background-secondary p-2",
					isSelecting && isSelected && !isLight
						? "border border-amber-50"
						: isSelecting && isSelected && isLight
							? "border border-primary"
							: undefined,
				)}
			>
				<View className="w-full flex-row justify-between">
					<Text className={cn(technicianClassName, report && "text-sm")}>
						{technician?.name?.split(" ")[0] ?? "Unknown"}
					</Text>

					<Text
						className={cn(className, report ? "mr-[-15] text-sm" : "mr-[-80]")}
					>
						${item.compensation}
					</Text>
					<Text className={cn(className, report && "mr-[-10] text-sm")}>
						${item.tip}
					</Text>
					{report ? (
						<Text className={cn(className, "text-sm")}>
							${Number.parseFloat((item.compensation + item.tip).toFixed(2))}
						</Text>
					) : null}
				</View>
			</Animated.View>
		</Pressable>
	);
};
