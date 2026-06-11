// hooks/useNavigationOptions.ts
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: intentional theme color dependency */
import type { Stack } from "expo-router";
import { type ComponentProps, useMemo } from "react";

import { Platform } from "react-native";

type StackScreenOptions = NonNullable<
	ComponentProps<typeof Stack.Screen>["options"]
>;

import { useThemeColor } from "@/utils";

export function useNavigationOptions() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	return useMemo(() => {
		/**
		 * NOTE
		 * root is needed for base stack navigator
		 * if only defined in the child a white space
		 * will be shown when navigating between screens
		 * when in dark mode
		 */
		const root: StackScreenOptions = {
			contentStyle: {
				backgroundColor: themeColorBackground,
			},
		};
		/**
		 * these are styles that you want on almost every screen
		 * i know modals may need different styling sometimes
		 * so sometimes you may need to remove something here or add to
		 * route!
		 *
		 * i love this setup!
		 */
		const base: StackScreenOptions = {
			headerTintColor: themeColorForeground,
			headerTitleAlign: "center",
			headerLargeTitleShadowVisible: false,
			headerLargeTitleStyle: {
				color: themeColorForeground,
			},

			headerShadowVisible: false,
			contentStyle: { backgroundColor: themeColorBackground },
		};

		return {
			root,
			standard: {
				...base,
				headerStyle: {
					/**
					 * if on liquid glass, trust me use transparent for
					 * header style background color
					 */
					backgroundColor:
						Platform.OS === "ios" ? "transparent" : themeColorBackground,
				},
				headerTransparent: Platform.OS === "ios",
			},
			modal: {
				/**
				 * if you use header
				 */
				...base,
				headerStyle: {
					// backgroundColor: themeColorBackground,
					backgroundColor:
						Platform.OS === "ios" ? "transparent" : themeColorBackground,
				},
			},
		};
	}, [themeColorBackground, themeColorForeground]);
}
