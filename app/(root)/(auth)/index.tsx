import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

import SignInButton from "@/components/Buttons/sign-in-button";
import { Container } from "@/components/container";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn, isProduction } from "@/utils";

export default function Landing() {
	const { isLight } = useAppTheme();
	return (
		<Container className="mb-6 gap-8 p-6">
			<View className="flex-1 justify-end">
				<View className="mb-40 aspect-video w-full rounded-xl">
					<Image
						source={require("@/assets/logo.jpg")}
						alt="Landing background"
						contentFit="contain"
						transition={1000}
						className="h-full w-full"
						style={{ width: "100%", height: "100%" }}
					/>
				</View>
				<Text
					className={cn(
						"font-bold text-4xl text-muted-foreground",
						!isLight && "text-gray-400",
					)}
				>
					The Beauty App
				</Text>
			</View>
			<View className="w-full flex-row py-4">
				{isProduction ? (
					<Text
						className={cn(
							"font-medium text-lg text-muted-foreground",
							!isLight && "text-white",
						)}
					>
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
