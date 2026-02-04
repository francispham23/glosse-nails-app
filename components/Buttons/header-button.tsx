import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, type Route, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { useThemeColor } from "@/utils";

type HeaderButtonProps = {
	iconName: React.ComponentProps<typeof Ionicons>["name"];
	route?: Route;
};

export const HeaderButton = ({ iconName, route }: HeaderButtonProps) => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");

	if (route)
		return (
			<Pressable
				className="justify-center rounded-full px-2.5"
				onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					router.navigate(route);
				}}
			>
				<Ionicons name={iconName} size={18} color={themeColorForeground} />
			</Pressable>
		);

	return (
		<Link href=".." asChild>
			<Pressable className="justify-center rounded-full px-2.5">
				<Ionicons name="close" size={18} color={themeColorForeground} />
			</Pressable>
		</Link>
	);
};
