import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { type Href, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { useTheme } from "react-native-paper";
import {
	controlGeometry,
	controlStyles,
	HeaderIconSurface,
} from "@/components/workspace/control-styles";
import { useWebRouteDismiss } from "@/contexts/web-route-dismiss-context";
import { useThemeColor } from "@/utils";
import { tryDismissModalRoute } from "@/utils/modal-route-dismiss";

type HeaderButtonProps = {
	iconName: React.ComponentProps<typeof Ionicons>["name"];
	route?: Href;
	back?: boolean;
	disabled?: boolean;
	isBlocked?: () => boolean;
};

export const HeaderButton = ({
	iconName,
	route,
	back = false,
	disabled = false,
	isBlocked,
}: HeaderButtonProps) => {
	const router = useRouter();
	const { colors } = useTheme();
	const foreground = useThemeColor("foreground");
	const { dismissDisabled, isDismissDisabled } = useWebRouteDismiss();
	const locked = disabled || (!route && dismissDisabled);
	const icon = (
		<Ionicons
			name={route ? iconName : back ? "chevron-back" : "close"}
			size={controlGeometry.iconSize}
			color={foreground}
		/>
	);
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={route ? "View technician" : back ? "Back" : "Close"}
			disabled={locked}
			accessibilityState={{ disabled: locked }}
			style={[
				back ? controlStyles.headerBack : controlStyles.headerTarget,
				{ opacity: locked ? 0.5 : 1 },
				back ? { backgroundColor: colors.surfaceVariant } : undefined,
			]}
			onPress={() => {
				if (locked || isBlocked?.() || (!route && isDismissDisabled())) return;
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				if (route) router.navigate(route);
				else if (back) {
					if (router.canGoBack()) router.back();
				} else
					tryDismissModalRoute(
						isDismissDisabled(),
						() => router.canGoBack(),
						() => router.dismiss(),
					);
			}}
		>
			{back ? (
				<>
					{icon}
					<Text style={{ color: foreground, fontSize: 16 }}>Back</Text>
				</>
			) : (
				<HeaderIconSurface>{icon}</HeaderIconSurface>
			)}
		</Pressable>
	);
};
