import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useNavigationOptions } from "@/hooks";
import {
	modalGroupAnimation,
	modalGroupPresentation,
} from "@/utils/modal-route";

export const unstable_settings = {
	anchor: "index",
};

export default function AuthLayout() {
	const { root, standard } = useNavigationOptions();
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "",
					...standard,
					headerShown: Platform.OS !== "web",
				}}
			/>
			<Stack.Screen
				name="email"
				options={{
					headerShown: false,
					presentation: modalGroupPresentation,
					animation: modalGroupAnimation,
					...root,
				}}
			/>
		</Stack>
	);
}
