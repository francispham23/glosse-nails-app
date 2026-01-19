import { useQuery } from "convex/react";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AddButton } from "@/components/Buttons/add-button";
import { GiftCard } from "@/components/gift-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { api } from "@/convex/_generated/api";
import type { Gift as GiftType } from "@/utils/types";

export default function GiftCardRoute() {
	const giftCards = useQuery(api.giftCards.list);
	const [isOpening, setIsOpening] = useState(false);

	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-4 px-3 pb-24"
				entering={FadeIn}
				exiting={FadeOut}
				data={giftCards}
				renderItem={({ item }: { item: GiftType }) => (
					<GiftCard giftCard={item} />
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={<ListEmptyComponent item="gift card" />}
			/>
			<View className="absolute bottom-30 self-center">
				<AddButton isAdding={isOpening} setIsAdding={setIsOpening} />
			</View>
		</Animated.View>
	);
}
