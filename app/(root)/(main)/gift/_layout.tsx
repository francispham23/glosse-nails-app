import { Stack } from "expo-router";
import { HeaderButton } from "@/components/Buttons/header-button";
import { ModalRouteLayout } from "@/components/workspace/modal-route-layout";
import { useModalStackOptions } from "@/hooks/use-modal-stack-options";

export default function GiftLayout() {
	const screenOptions = useModalStackOptions();

	return (
		<ModalRouteLayout>
			<Stack screenOptions={screenOptions}>
				<Stack.Screen
					name="create"
					options={{
						headerLeft: () => <HeaderButton iconName="close" />,
						headerShown: true,
						title: "",
					}}
				/>
			</Stack>
		</ModalRouteLayout>
	);
}
