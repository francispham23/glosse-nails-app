import { Stack } from "expo-router";

import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function ReportLayout() {
	const { standard } = useNavigationOptions();
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Report",
					headerTitle: "Report",
					headerLargeTitle: true,
					headerBackTitle: "Home",
					...standard,
					headerLeft: () => (
						<HeaderButton iconName="calendar-outline" route="/pick-date" />
					),
					headerRight: () => (
						<HeaderButton iconName="settings-outline" route="/settings" />
					),
				}}
			/>
		</Stack>
	);
}
