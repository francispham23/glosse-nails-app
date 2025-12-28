import { Link } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";

import SignInButton from "@/components/Buttons/sign-in-button";
import { Container } from "@/components/container";

export default function Landing() {
	return (
		<Container className="mb-6 gap-8 p-6">
			<View className="flex-1 justify-end">
				<Text className="font-extrabold text-6xl text-foreground">
					Glosse Nails
				</Text>
				<Text className="text-muted-foreground text-xl">The Beauty App</Text>
			</View>
			<View className="w-full flex-row pb-2">
				<SignInButton />
			</View>
			{/* TODO: Auth with Email */}
			<Link href="/(root)/(auth)/email/signin" asChild>
				<Button className="w-full rounded-full" size="lg">
					<Button.Label>Email</Button.Label>
				</Button>
			</Link>
		</Container>
	);
}
