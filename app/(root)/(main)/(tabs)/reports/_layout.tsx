import { Stack } from "expo-router";

import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/use-navigation-options";

export default function ReportsLayout() {
	const { standard } = useNavigationOptions();
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Reports",
					headerTitle: "Reports",
					headerLargeTitle: true,
					headerBackTitle: "Home",
					...standard,
					headerRight: () => (
						<HeaderButton iconName="settings-outline" route="/settings" />
					),
				}}
			/>
		</Stack>
	);
}
