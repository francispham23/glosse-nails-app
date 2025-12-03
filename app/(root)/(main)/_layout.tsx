import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

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
				name="settings"
				options={{
					title: "Settings",
					headerBackButtonDisplayMode: "generic",
					headerLargeTitle: true,
					...standard,
					headerRight: () => <ThemeToggle />,
				}}
			/>
		</Stack>
	);
}
