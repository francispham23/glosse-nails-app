import { useAuthActions } from "@convex-dev/auth/react";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, useColorScheme } from "react-native";

import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function MainLayout() {
	const colorScheme = useColorScheme();
	const { standard, modal } = useNavigationOptions();

	useEffect(() => {
		if (Platform.OS === "android") {
			NavigationBar.setButtonStyleAsync(
				colorScheme === "light" ? "dark" : "light",
			);
		}
	}, [colorScheme]);

	return (
		<Stack>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="technician/[technicianId]"
				options={{
					headerShown: false,
					presentation: "modal",
					...modal,
				}}
			/>
			<Stack.Screen
				name="settings"
				options={{
					title: "Settings",
					headerBackButtonDisplayMode: "generic",
					headerLargeTitle: true,
					...standard,
					headerRight: () => <SignOutButton />,
				}}
			/>
		</Stack>
	);
}

const SignOutButton = () => {
	const [isSigningOut, setIsSigningOut] = useState(false);
	const { signOut } = useAuthActions();

	const handleOnPress = () => {
		setIsSigningOut(true);
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Sign Out",
				onPress: () => {
					void signOut();
				},
			},
		]);
		setIsSigningOut(false);
	};

	return (
		<Pressable
			className="justify-center rounded-full px-3"
			disabled={isSigningOut}
			onPress={handleOnPress}
		>
			<Text className="text-foreground">Sign Out</Text>
		</Pressable>
	);
};
