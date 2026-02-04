import { useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";
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
		!isLight && "text-gray-300",
	);

	const className = cn(
		"text-right text-lg text-muted",
		!isLight && "text-gray-300",
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
					"flex-row justify-between rounded-lg border-r-accent bg-gray-300 p-2 shadow-md dark:bg-gray-700",
					isSelecting && isSelected && !isLight
						? "border border-amber-50"
						: isSelecting && isSelected && isLight
							? "border border-primary"
							: undefined,
				)}
			>
				<View className="w-full flex-row items-center gap-4">
					<Text
						className={cn(technicianClassName, report && "text-sm", "flex-1")}
					>
						{technician?.name?.split(" ")[0] ?? "Unknown"}
					</Text>

					<Text className={cn(className, report && "text-sm", "min-w-[60]")}>
						${item.compensation}
					</Text>
					<Text className={cn(className, report && "text-sm", "min-w-[60]")}>
						${item.tip}
					</Text>
					{report ? (
						<Text className={cn(className, "min-w-[70] text-sm")}>
							${Number.parseFloat((item.compensation + item.tip).toFixed(2))}
						</Text>
					) : null}
				</View>
			</Animated.View>
		</Pressable>
	);
};
