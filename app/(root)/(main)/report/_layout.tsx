import { Stack } from "expo-router";
import { HeaderButton } from "@/components/Buttons/header-button";
import { modalHeaderOptions } from "@/components/workspace/modal-header-options";
import { ModalRouteLayout } from "@/components/workspace/modal-route-layout";
import { useModalStackOptions } from "@/hooks/use-modal-stack-options";

export default function ReportLayout() {
	const screenOptions = useModalStackOptions();

	return (
		<ModalRouteLayout>
			<Stack screenOptions={screenOptions}>
				<Stack.Screen
					name="payroll"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>

				<Stack.Screen
					name="cash"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>
				<Stack.Screen
					name="gift"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>
				<Stack.Screen
					name="discount"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>
				<Stack.Screen
					name="income"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>
				<Stack.Screen
					name="supply"
					options={modalHeaderOptions({
						headerBackButtonDisplayMode: "generic",
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					})}
				/>
			</Stack>
		</ModalRouteLayout>
	);
}
