import type { Stack } from "expo-router";
import { type ComponentProps, useMemo } from "react";
import { Platform } from "react-native";
import { useNavigationOptions } from "@/hooks/use-navigation-options";
import { useThemeColor } from "@/utils";

type StackScreenOptions = NonNullable<
	ComponentProps<typeof Stack>["screenOptions"]
>;

export function useModalStackOptions(): StackScreenOptions {
	const { modal } = useNavigationOptions();
	const themeColorBackground = useThemeColor("background");

	return useMemo(
		() => ({
			gestureEnabled: false,
			headerTransparent: Platform.OS !== "web",
			...modal,
			...(Platform.OS === "web"
				? {
						headerStyle: { backgroundColor: themeColorBackground },
						contentStyle: {
							flex: 1,
							backgroundColor: themeColorBackground,
						},
					}
				: {}),
		}),
		[modal, themeColorBackground],
	);
}
