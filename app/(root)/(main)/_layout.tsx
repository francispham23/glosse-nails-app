import { Stack } from "expo-router";

import { ThemeToggleButton } from "@/components/Buttons/theme-toggle-button";
import { useNavigationOptions } from "@/hooks";

export default function MainLayout() {
	const { standard, root } = useNavigationOptions();

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
				name="transaction"
				options={{
					headerShown: false,
					presentation: "modal",
					...root,
				}}
			/>
			<Stack.Screen
				name="gift"
				options={{
					headerShown: false,
					presentation: "modal",
					...root,
				}}
			/>
			<Stack.Screen
				name="report"
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
