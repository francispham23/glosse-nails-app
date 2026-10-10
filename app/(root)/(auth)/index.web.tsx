import { Image } from "expo-image";
import { Link } from "expo-router";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SignInButton from "@/components/Buttons/sign-in-button";
import { cn, isProduction } from "@/utils";

export default function Landing() {
	const { width, height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const availableHeight = Math.max(0, height - insets.top - insets.bottom);
	const columnWidth = Math.min(360, Math.max(1, width - 48));
	const logoSize = Math.min(320, columnWidth);
	// Center the logo itself; allow the content below it to scroll on short screens.
	const logoTop = Math.max(24, (availableHeight - logoSize) / 2);

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{
				minHeight: height,
				alignItems: "center",
				paddingTop: insets.top + logoTop,
				paddingBottom: insets.bottom + 24,
				paddingHorizontal: 24,
			}}
		>
			<Image
				source={require("@/assets/logo.jpg")}
				accessibilityLabel="Glossé Nails"
				accessible
				contentFit="contain"
				style={{ width: logoSize, height: logoSize, flexShrink: 0 }}
			/>
			<View style={{ width: columnWidth, marginTop: 24, gap: 16 }}>
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
