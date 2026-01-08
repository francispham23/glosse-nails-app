import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function ReportRoute() {
	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<View className="flex-1 items-center justify-center px-5">
				<Text className="font-bold text-2xl text-foreground">Report</Text>
				<Text className="mt-2 text-center text-muted-foreground">
					Report screen content will go here
				</Text>
			</View>
		</Animated.View>
	);
}
