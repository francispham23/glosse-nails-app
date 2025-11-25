import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import { SettingsButton } from "@/components/settings-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function MainLayout() {
	const colorScheme = useColorScheme();
	const { standard } = useNavigationOptions();

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
				name="index"
				options={{
					title: "Earnings",
					headerTitle: "Earnings",
					headerLargeTitle: true,
					headerBackTitle: "Home",
					...standard,
					headerRight: () => <SettingsButton />,
					headerLeft: () => <ThemeToggle />,
				}}
			/>
		</Stack>
	);
}
