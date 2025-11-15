import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";

export default function MainLayout() {
	const { standard } = useNavigationOptions();

	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Informational",
					headerTitle: "Informational",
					headerLargeTitle: true,
					headerBackTitle: "Home",
					...standard,
					headerRight: () => <SettingsButton />,
					headerLeft: () => <ThemeToggle />,
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

const SettingsButton = () => {
	const themeColorForeground = useThemeColor("foreground");
	const router = useRouter();

	return (
		<Pressable
			className="justify-center rounded-full p-2.5"
			onPress={() => {
				router.navigate("/settings");
			}}
		>
			<Ionicons
				name="settings-outline"
				size={18}
				color={themeColorForeground}
			/>
		</Pressable>
	);
};

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
