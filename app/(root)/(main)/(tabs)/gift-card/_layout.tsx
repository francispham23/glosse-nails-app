import { Stack } from "expo-router";

import { useNavigationOptions } from "@/hooks";

export default function GiftCardLayout() {
	const { standard } = useNavigationOptions();

	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Gift Card",
					headerTitle: "Gift Card",
					headerLargeTitle: true,
					headerBackTitle: "Home",
					...standard,
				}}
			/>
		</Stack>
	);
}
