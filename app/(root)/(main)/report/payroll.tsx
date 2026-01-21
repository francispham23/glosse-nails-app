import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ListEmptyComponent } from "@/components/list-empty";
import { TechnicianCard } from "@/components/technician-card";
import { api } from "@/convex/_generated/api";

export default function ReportRoute() {
	const params = useLocalSearchParams();
	const startDate = params.startDate ? Number(params.startDate) : Date.now();
	const endDate = params.endDate ? Number(params.endDate) : Date.now();

	const technicians = useQuery(api.users.usersByDateRange, {
		startDate,
		endDate,
		report: true,
	});

	const classname = cn("font-semibold text-foreground");

	return (
		<Animated.View
			className="flex-1 gap-2 px-6 pt-18"
			entering={FadeIn}
			exiting={FadeOut}
		>
			<Text className="font-extrabold text-3xl text-foreground">
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
