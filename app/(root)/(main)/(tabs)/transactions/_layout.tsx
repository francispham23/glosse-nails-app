import { Stack } from "expo-router";

import { PickDateButton } from "@/components/Buttons/pick-date-button";
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
					headerLeft: () => <PickDateButton />,
					headerRight: () => <SettingsButton />,
				}}
			/>
		</Stack>
	);
}
