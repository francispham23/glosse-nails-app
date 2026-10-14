import { Link, Stack } from "expo-router";
import { Button } from "react-native-paper";

import { HeaderButton } from "@/components/Buttons/header-button";
import { ModalRouteLayout } from "@/components/workspace/modal-route-layout";
import { useModalStackOptions } from "@/hooks/use-modal-stack-options";
import { isProduction } from "@/utils";

export default function EmailLayout() {
	const screenOptions = useModalStackOptions();
	return (
		<ModalRouteLayout>
			<Stack screenOptions={screenOptions}>
				<Stack.Screen
					name="signin"
					options={{
						headerLeft: () => <HeaderButton iconName="close" />,
						headerRight: () => (isProduction ? null : <SignUpButton />),
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
		</ModalRouteLayout>
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
