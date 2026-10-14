import type { Href } from "expo-router";
import { Stack, useLocalSearchParams } from "expo-router";
import { HeaderButton } from "@/components/Buttons/header-button";
import { ModalRouteLayout } from "@/components/workspace/modal-route-layout";
import { useModalStackOptions } from "@/hooks/use-modal-stack-options";
import type { User } from "@/utils/types";

export default function TechnicianLayout() {
	const screenOptions = useModalStackOptions();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technicianRoute = `/(root)/(main)/technician/${technicianId}` as Href;

	return (
		<ModalRouteLayout>
			<Stack screenOptions={screenOptions}>
				<Stack.Screen
					name="[technicianId]/create"
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
		</ModalRouteLayout>
	);
}
