import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { Button, cn, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";

export default function SettingsRoute() {
	const { isLight } = useAppTheme();
	const themeColorForeground = useThemeColor("foreground");
	const user = useQuery(api.users.viewer);

	const { signOut } = useAuthActions();

	const [isSigningOut, setIsSigningOut] = useState(false);

	const className = cn("text-lg text-muted", !isLight && "-foreground");

	if (!user) return <Spinner className="flex-1 items-center justify-center" />;

	return (
		<Animated.View className="flex-1">
			<ScrollView
				contentInsetAdjustmentBehavior="always"
				contentContainerClassName="px-6 py-2 gap-4 min-h-full "
			>
				<Text className={cn("font-bold text-2xl", !isLight && "text-white")}>
					User Info Section
				</Text>
				<View className="flex">
					<Text className={className}>{user.name}</Text>
					<Text className={className}>{user.email}</Text>
					<Text className={className}>
						created {new Date(user._creationTime).toDateString()}
					</Text>
				</View>
			</ScrollView>
		</Animated.View>
	);
}
