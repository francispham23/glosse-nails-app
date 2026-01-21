import { Stack } from "expo-router";
import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/use-navigation-options";

export default function ReportLayout() {
	const { modal } = useNavigationOptions();

	return (
		<Stack
			screenOptions={{
				gestureEnabled: false,
				headerTransparent: true,
				...modal,
			}}
		>
			<Stack.Screen
				name="payroll"
				options={{
					headerBackButtonDisplayMode: "generic",
					headerLeft: () => <HeaderButton iconName="close" />,
					headerShown: true,
					title: "",
				}}
			/>
			<Stack.Screen
				name="discount"
				options={{
					headerBackButtonDisplayMode: "generic",
					headerLeft: () => <HeaderButton iconName="close" />,
					headerShown: true,
					title: "",
				}}
			/>
			<Stack.Screen
				name="cash"
				options={{
					headerBackButtonDisplayMode: "generic",
					headerLeft: () => <HeaderButton iconName="close" />,
					headerShown: true,
					title: "",
				}}
			/>
		</Stack>
	);
}
