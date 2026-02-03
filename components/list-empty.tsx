import { useEffect, useState } from "react";
import { Text } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface Props {
	item?: string;
}

export const ListEmptyComponent = ({ item }: Props) => {
	const [spinning, setSpinning] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => setSpinning(false), 2000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Animated.View
			className="flex-1 items-center justify-center py-10"
			entering={FadeIn}
			exiting={FadeOut}
		>
			{spinning ? (
				<ActivityIndicator className="flex-1 items-center justify-center" />
			) : (
				<Text className="text-muted">
					No {item ? `${item}s` : "data"} to display.
				</Text>
			)}
		</Animated.View>
	);
};
