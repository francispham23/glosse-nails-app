import { Stack } from "expo-router";

import { SettingsButton } from "@/components/settings-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function Layout() {
	const { standard } = useNavigationOptions();

	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Transactions",
					headerTitle: "Transactions",
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
