import { Stack } from "expo-router";
import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/use-navigation-options";

export default function TransactionLayout() {
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
				name="[transactionId]/edit"
				options={{
					headerLeft: () => <HeaderButton iconName="close" />,
					headerShown: true,
					title: "",
				}}
			/>
		</Stack>
	);
}
