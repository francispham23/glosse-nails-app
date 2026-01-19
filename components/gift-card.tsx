import { cn } from "heroui-native";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/contexts/app-theme-context";

type GiftCard = {
	_id: string;
	_creationTime: number;
	code: string;
	balance: number;
};

type Props = {
	giftCard: GiftCard;
};

export const GiftCard = ({ giftCard }: Props) => {
	const { isLight } = useAppTheme();
	const textClassName = cn(
		"align-left text-lg text-muted",
		!isLight && "-foreground",
	);
	const balanceClassName = cn(
		"text-left font-semibold text-xl",
		giftCard.balance > 0 ? "text-success" : "text-muted-foreground",
	);

	return (
		<Animated.View
			key={giftCard._id}
			entering={FadeIn}
			exiting={FadeOut}
			className="flex-row gap-2 rounded-lg border-l-4 border-l-accent bg-background-secondary p-2"
		>
			<View className="w-50 flex-row items-center gap-2">
				<Text className={textClassName}>Code:</Text>
				<Text className="font-medium font-mono text-foreground text-lg">
					{giftCard.code}
				</Text>
			</View>
			<View className="flex-row items-center gap-2">
				<Text className={textClassName}>Balance:</Text>
				<Text className={balanceClassName}>${giftCard.balance.toFixed(2)}</Text>
			</View>
		</Animated.View>
	);
};
