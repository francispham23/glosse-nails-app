import type { Route } from "expo-router";
import { Stack, useLocalSearchParams } from "expo-router";

import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";
import type { User } from "@/utils/types";

export default function TechnicianLayout() {
	const { modal } = useNavigationOptions();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technicianRoute = `/(root)/(main)/technician/${technicianId}` as Route;

	return (
		<Stack
			screenOptions={{
				gestureEnabled: false,
				headerTransparent: true,
				...modal,
			}}
		>
			<Stack.Screen
				name="[technicianId]/form"
				options={{
					headerLeft: () => <HeaderButton iconName="close" />,
					headerRight: () => (
						<HeaderButton
							iconName="swap-horizontal-outline"
							route={technicianRoute}
						/>
					),
					headerShown: true,
					title: "",
				}}
			/>
			<Stack.Screen
				name="[technicianId]/index"
				options={{
					headerBackButtonDisplayMode: "generic",
					headerShown: true,
					title: "",
				}}
			/>
		</Stack>
	);
}
