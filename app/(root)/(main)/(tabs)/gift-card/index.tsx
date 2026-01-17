import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function GiftCardRoute() {
	return (
		<Animated.View className="flex-1 p-6" entering={FadeIn} exiting={FadeOut}>
			<View className="flex-1 items-center justify-center">
				<Text className="font-bold text-2xl text-foreground">Gift Card</Text>
				<Text className="mt-4 text-center text-muted-foreground">
					Gift card management coming soon
				</Text>
			</View>
		</Animated.View>
	);
}
