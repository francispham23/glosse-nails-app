import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { TechnicianCard } from "@/components/Cards/technician-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { modalScreenClassName } from "@/components/workspace/modal-screen";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import { cn } from "@/utils";

export default function PayrollRoute() {
	const { isLight } = useAppTheme();
	const params = useLocalSearchParams();
	const [fallbackDate] = useState(() => Date.now());
	const startDate = params.startDate ? Number(params.startDate) : fallbackDate;
	const endDate = params.endDate ? Number(params.endDate) : fallbackDate;

	const technicians = useQuery(api.users.usersByDateRange, {
		startDate,
		endDate,
		report: true,
	});

	const classname = cn(
		"font-semibold text-foreground",
		!isLight && "text-gray-300",
	);

	return (
		<Animated.View
			className={modalScreenClassName()}
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text
				className={cn(
					"font-extrabold text-3xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				PayRoll Report
			</Text>
			<View className="flex-1 pt-6">
				<View className="mb-2 flex-row justify-between px-2">
					<Text className={classname}>Technician</Text>
					<Text className={cn(classname, "text-right")}>Commission</Text>
					<Text className={cn(classname, "text-right")}>Tips</Text>
					<Text className={cn(classname, "text-right")}>Total</Text>
				</View>

				<FlatList
					data={technicians}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <TechnicianCard item={item} report />}
					contentContainerClassName="gap-2"
					ListEmptyComponent={<ListEmptyComponent item="technician" />}
				/>
			</View>
		</Animated.View>
	);
}
