import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { Text } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { TransactionCard } from "@/components/transaction-card";
import { api } from "@/convex/_generated/api";
import type { Transaction, User } from "@/utils/types";

export default function TechnicianDetail() {
	const params = useLocalSearchParams();
	const background = useThemeColor("background");

	const userId = params.technicianId as User["_id"];

	const technician = useQuery(api.users.getUserById, { userId });
	const transactions = useQuery(api.transactions.listByTechnicianId, {
		userId,
	});

	return technician && transactions ? (
		<Animated.View className="flex-1 p-4" entering={FadeIn} exiting={FadeOut}>
			<Text className="text-center font-bold text-lg">{technician.name}</Text>
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-3 pb-24"
				data={transactions}
				renderItem={({ item }: { item: Transaction }) => {
					return <TransactionCard transaction={item} />;
				}}
				keyExtractor={(item) => item._id.toString()}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={<Text>No Transaction</Text>}
			/>
			<Button
				onPress={() => {}}
				className="absolute bottom-10 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Transaction</Button.Label>
				<Ionicons name="add-outline" size={18} color={background} />
			</Button>
		</Animated.View>
	) : (
		<Animated.View
			className="flex-1 items-center justify-center"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text>Not Found</Text>
		</Animated.View>
	);
}
