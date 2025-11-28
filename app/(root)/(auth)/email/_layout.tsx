import { Link, Stack } from "expo-router";
import { Pressable, Text } from "react-native";

import { CloseButton } from "@/components/Buttons/close-button";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function EmailLayout() {
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
				name="signin"
				options={{
					headerLeft: () => <CloseButton />,
					headerRight: () => <SignUpButton />,
					title: "",
				}}
			/>
			<Stack.Screen
				name="signup"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="(reset)/request-password-reset"
				options={{
					title: "",
				}}
			/>
			<Stack.Screen
				name="(reset)/reset-password"
				options={{
					title: "",
				}}
			/>
		</Stack>
	);
}

const SignUpButton = () => {
	return (
		<Link href="/(root)/(auth)/email/signup" asChild>
			<Pressable className="justify-center rounded-full px-3">
				<Text className="text-foreground">Sign Up</Text>
			</Pressable>
		</Link>
	);
};
