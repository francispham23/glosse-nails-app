import { Link } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import SignIn from "@/components/sign-in";

export default function Landing() {
	return (
		<Container className="gap-8 p-6">
			<View className="flex-1 justify-end">
				<Text className="font-extrabold text-6xl text-foreground">
					Glosse Nails
				</Text>
				<Text className="text-muted-foreground text-xl">
					Convex + Better Auth + Expo + Heroui = 🚀
				</Text>
			</View>
			<View className="w-full flex-row gap-4">
				<SignIn />
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
