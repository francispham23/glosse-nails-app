import { useQuery } from "convex/react";
import { Link, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Button } from "react-native-paper";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TransactionCard } from "@/components/transaction-card";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";
import type { Transaction, User } from "@/utils/types";

export default function TechnicianId() {
	const { isLight } = useAppTheme();
	const { startOfDay, endOfDay } = useAppDate();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, { userId: technicianId });
	const transactions = useQuery(api.transactions.listByTechnicianAndDateRange, {
		technicianId,
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text
				className={cn(
					"font-extrabold text-3xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
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
			<Link href=".." asChild>
				<Button
					className="absolute bottom-10 self-center overflow-hidden rounded-full"
					icon="plus"
				>
					Create Transaction
				</Button>
			</Link>
		</Animated.View>
	);
}
