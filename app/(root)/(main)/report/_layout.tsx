import { Stack } from "expo-router";

import { HeaderButton } from "@/components/Buttons/header-button";
import { ModalRouteLayout } from "@/components/workspace/modal-route-layout";
import { useModalStackOptions } from "@/hooks/use-modal-stack-options";

export default function ReportLayout() {
	const screenOptions = useModalStackOptions();

	return (
		<ModalRouteLayout>
			<Stack screenOptions={screenOptions}>
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
					name="cash"
					options={{
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					}}
				/>
				<Stack.Screen
					name="gift"
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
					name="income"
					options={{
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					}}
				/>
				<Stack.Screen
					name="supply"
					options={{
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					}}
				/>
			</Stack>
		</ModalRouteLayout>
	);
}
