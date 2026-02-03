import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import SignInButton from "@/components/Buttons/sign-in-button";
import { Container } from "@/components/container";

export default function Landing() {
	return (
		<Container className="mb-6 gap-8 p-6">
			<View className="flex-1 justify-end">
				<Text className="font-extrabold text-6xl text-foreground">
					Glossé Nails
				</Text>
				<Text className="text-muted-foreground text-xl">The Beauty App</Text>
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
