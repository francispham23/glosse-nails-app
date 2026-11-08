import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { withUniwind } from "uniwind";
import {
	controlGeometry,
	controlStyles,
	HeaderIconSurface,
} from "@/components/workspace/control-styles";

import { useAppTheme } from "@/contexts/app-theme-context";

const StyledIonicons = withUniwind(Ionicons);

export function ThemeToggleButton() {
	const { toggleTheme, isLight } = useAppTheme();

	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				toggleTheme();
			}}
			accessibilityRole="button"
			accessibilityLabel={isLight ? "Use dark theme" : "Use light theme"}
			style={controlStyles.headerTarget}
		>
			<HeaderIconSurface>
				{isLight ? (
					<Animated.View key="moon" entering={ZoomIn} exiting={FadeOut}>
						<StyledIonicons
							name="moon"
							size={controlGeometry.iconSize}
							className="text-foreground"
						/>
					</Animated.View>
				) : (
					<Animated.View key="sun" entering={ZoomIn} exiting={FadeOut}>
						<StyledIonicons
							name="sunny"
							size={controlGeometry.iconSize}
							className="text-foreground"
						/>
					</Animated.View>
				)}
			</HeaderIconSurface>
		</Pressable>
	);
}
