import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { type Href, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useWebRouteDismiss } from "@/contexts/web-route-dismiss-context";
import { useThemeColor } from "@/utils";
import { tryDismissModalRoute } from "@/utils/modal-route-dismiss";

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
	const { dismissDisabled, isDismissDisabled } = useWebRouteDismiss();
	const closeLocked = disabled || dismissDisabled;

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
		<Pressable
			className="justify-center rounded-full px-2.5"
			disabled={closeLocked}
			accessibilityState={{ disabled: closeLocked }}
			accessibilityLabel="Close"
			style={{ opacity: closeLocked ? 0.5 : 1 }}
			onPress={() => {
				if (closeLocked || isBlocked?.() || isDismissDisabled()) return;
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				tryDismissModalRoute(
					isDismissDisabled(),
					() => router.canGoBack(),
					() => router.dismiss(),
				);
			}}
		>
			<Ionicons name="close" size={18} color={themeColorForeground} />
		</Pressable>
	);
};
