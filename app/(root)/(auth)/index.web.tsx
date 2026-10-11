import { Image } from "expo-image";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";

import SignInButton from "@/components/Buttons/sign-in-button";
import { cn, isProduction } from "@/utils";

export default function Landing() {
	return (
		<ScrollView
			className="landing-web flex-1 bg-background"
			contentContainerStyle={{
				alignItems: "center",
				paddingBottom: 24,
				paddingHorizontal: 24,
			}}
		>
			<View className="landing-web-offset" />
			<Image
				source={require("@/assets/logo.jpg")}
				accessibilityLabel="Glossé Nails"
				accessible
				contentFit="contain"
				className="landing-web-logo"
				style={{ flexShrink: 0 }}
			/>
			<View style={{ width: "100%", maxWidth: 360, marginTop: 24, gap: 16 }}>
				<Text
					className={cn("text-center font-bold text-4xl text-muted-foreground")}
				>
					The Beauty App
				</Text>
				<View className="w-full flex-row">
					{isProduction ? (
						<Text
							className={cn(
								"w-full text-center font-medium text-lg text-muted-foreground",
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
			</View>
		</ScrollView>
	);
}
