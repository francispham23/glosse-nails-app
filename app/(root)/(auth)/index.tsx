import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, useWindowDimensions, View } from "react-native";
import { Button } from "react-native-paper";

import SignInButton from "@/components/Buttons/sign-in-button";
import { Container } from "@/components/container";
import { cn, isProduction } from "@/utils";

export default function Landing() {
	const { width } = useWindowDimensions();
	const logoSize = Math.min(320, Math.max(1, width - 48));
	return (
		<Container className="mb-6 gap-8 p-6">
			<View className="flex-1 justify-end">
				<View className="mb-8 items-center">
					<Image
						source={require("@/assets/logo.jpg")}
						accessibilityLabel="Glossé Nails"
						accessible
						contentFit="contain"
						style={{ width: logoSize, height: logoSize }}
					/>
				</View>
				<Text className={cn("font-bold text-4xl text-muted-foreground")}>
					The Beauty App
				</Text>
			</View>
			<View className="w-full flex-row py-4">
				{isProduction ? (
					<Text className={cn("font-medium text-lg text-muted-foreground")}>
						Sign in with Email
					</Text>
				) : (
					<SignInButton />
				)}
			</View>
			<Link href="/(root)/(auth)/email/signin" asChild>
				<Button mode="contained" className="w-full rounded-full">
					Email
				</Button>
			</Link>
		</Container>
	);
}
