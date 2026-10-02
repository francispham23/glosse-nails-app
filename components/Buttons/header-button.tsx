import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { type Href, Link, useRouter } from "expo-router";
import { Pressable } from "react-native";

import { useThemeColor } from "@/utils";

type HeaderButtonProps = {
	iconName: React.ComponentProps<typeof Ionicons>["name"];
	route?: Href;
	disabled?: boolean;
	isBlocked?: () => boolean;
};

export const HeaderButton = ({
	iconName,
	route,
	disabled = false,
	isBlocked,
}: HeaderButtonProps) => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");

	if (route)
		return (
			<Pressable
				className="justify-center rounded-full px-2.5"
				disabled={disabled}
				accessibilityState={{ disabled }}
				accessibilityLabel={route ? "View technician" : "Close"}
				style={{ opacity: disabled ? 0.5 : 1 }}
				onPress={() => {
					if (disabled || isBlocked?.()) return;
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					router.navigate(route);
				}}
			>
				<Ionicons name={iconName} size={18} color={themeColorForeground} />
			</Pressable>
		);

	return (
		<Link
			href=".."
			asChild
			onPress={(event) => {
				if (disabled || isBlocked?.()) event.preventDefault();
			}}
		>
			<Pressable
				className="justify-center rounded-full px-2.5"
				disabled={disabled}
				accessibilityState={{ disabled }}
				accessibilityLabel={route ? "View technician" : "Close"}
				style={{ opacity: disabled ? 0.5 : 1 }}
			>
				<Ionicons name="close" size={18} color={themeColorForeground} />
			</Pressable>
		</Link>
	);
};
