import { Stack } from "expo-router";

import { CalendarButton } from "@/components/Buttons/calendar-button";
import { SettingsButton } from "@/components/Buttons/settings-button";
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
					headerLeft: () => <CalendarButton />,
					headerRight: () => <SettingsButton />,
				}}
			/>
		</Stack>
	);
}
