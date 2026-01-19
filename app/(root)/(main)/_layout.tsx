import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import { ThemeToggleButton } from "@/components/Buttons/theme-toggle-button";
import { useNavigationOptions } from "@/hooks/use-navigation-options";

export default function MainLayout() {
	const colorScheme = useColorScheme();
	const { standard, root } = useNavigationOptions();

	useEffect(() => {
		if (Platform.OS === "android") {
			NavigationBar.setButtonStyleAsync(
				colorScheme === "light" ? "dark" : "light",
			);
		}
	}, [colorScheme]);

	return (
		<Stack>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="technician"
				options={{
					headerShown: false,
					presentation: "modal",
					...root,
				}}
			/>
			<Stack.Screen
				name="pick-date"
				options={{
					headerShown: false,
					presentation: "transparentModal",
					animation: "fade",
				}}
			/>
			<Stack.Screen
				name="settings"
				options={{
					title: "Settings",
					headerBackButtonDisplayMode: "generic",
					headerLargeTitle: true,
					...standard,
					headerRight: () => <ThemeToggleButton />,
				}}
			/>
		</Stack>
	);
}
