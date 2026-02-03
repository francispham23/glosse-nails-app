import { Link, Stack } from "expo-router";
import { Button } from "react-native-paper";

import { HeaderButton } from "@/components/Buttons/header-button";
import { useNavigationOptions } from "@/hooks/use-navigation-options";

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
					headerLeft: () => <HeaderButton iconName="close" />,
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
			<Button mode="text" className="rounded-full">
				Sign Up
			</Button>
		</Link>
	);
};
