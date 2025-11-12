import { Link } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignIn from "@/app/SignIn";

export default function Landing() {
	return (
		<SafeAreaView className="flex-1 gap-4 px-8">
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
					<Button.LabelContent>Email</Button.LabelContent>
				</Button>
			</Link>
		</SafeAreaView>
	);
}
