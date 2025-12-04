import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { Text } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TransactionCard } from "@/components/transaction-card";
import { api } from "@/convex/_generated/api";
import type { Transaction, User } from "@/utils/types";

export default function TechnicianId() {
	const router = useRouter();
	const background = useThemeColor("background");

	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const transactions = useQuery(api.transactions.listByTechnician, {
		technicianId,
	});
	const technician = useQuery(api.users.getUserById, { userId: technicianId });

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text className="font-extrabold text-3xl text-foreground">
				{technician?.name}
			</Text>
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-3 pb-24"
				data={transactions}
				renderItem={({ item }: { item: Transaction }) => {
					return (
						<TransactionCard
							key={item._id}
							transaction={item}
							technicianId={technicianId}
						/>
					);
				}}
				keyExtractor={(item) => item._id.toString()}
				itemLayoutAnimation={LinearTransition}
				ListEmptyComponent={<ListEmptyComponent item="transaction" />}
			/>
			<Button
				onPress={() => router.push(`/technician/${technicianId}/form`)}
				className="absolute bottom-10 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Transaction</Button.Label>
				<Ionicons name="add-outline" size={18} color={background} />
			</Button>
		</Animated.View>
	);
}
