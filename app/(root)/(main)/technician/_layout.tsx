import { Stack, useLocalSearchParams } from "expo-router";

import { CloseButton } from "@/components/Buttons/close-button";
import { TransactionsButton } from "@/components/Buttons/transactions-button";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";
import type { User } from "@/utils/types";

export default function TechnicianLayout() {
	const { modal } = useNavigationOptions();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];

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
					headerLeft: () => <CloseButton />,
					headerRight: () => <TransactionsButton technicianId={technicianId} />,
					headerShown: true,
					title: "",
				}}
			/>
			<Stack.Screen
				name="[technicianId]/index"
				options={{
					headerLeft: () => <CloseButton />,
					headerShown: true,
					title: "",
				}}
			/>
		</Stack>
	);
}
