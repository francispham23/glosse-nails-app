import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import SignInButton from "@/components/Buttons/sign-in-button";
import { Container } from "@/components/container";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";

export default function Landing() {
	const { isLight } = useAppTheme();
	return (
		<Container className="mb-6 gap-8 p-6">
			<View className="flex-1 justify-end">
				<Text
					className={cn(
						"font-extrabold text-6xl text-foreground",
						!isLight && "text-white",
					)}
				>
					Glossé Nails
				</Text>
				<Text
					className={cn(
						"text-muted-foreground text-xl",
						!isLight && "text-gray-400",
					)}
				>
					The Beauty App
				</Text>
			</View>
			<View className="w-full flex-row py-4">
				<SignInButton />
			</View>
			<Link href="/(root)/(auth)/email/signin" asChild>
				<Button mode="contained" className="w-full rounded-full">
					Email
				</Button>
			</Link>
		</Container>
	);
}
