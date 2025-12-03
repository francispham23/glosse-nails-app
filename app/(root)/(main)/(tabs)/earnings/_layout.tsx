import { Stack } from "expo-router";

import { CalendarButton } from "@/components/Buttons/calendar-button";
import { SettingsButton } from "@/components/Buttons/settings-button";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function MainLayout() {
	const { standard } = useNavigationOptions();

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
					headerLeft: () => <CalendarButton />,
					headerRight: () => <SettingsButton />,
				}}
			/>
		</Stack>
	);
}
