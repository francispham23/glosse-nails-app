import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router/stack";
import { Button, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { api } from "@/convex/_generated/api";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";
import type { User } from "@/utils/types";

export default function TechnicianDetail() {
	const { modal } = useNavigationOptions();
	const params = useLocalSearchParams();
	const background = useThemeColor("background");

	const userId = params.technicianId as User["_id"];

	const technician = useQuery(api.users.getUserById, { userId });

	return (
		<>
			<Stack.Screen
				options={{
					title: "Technician Details",
					headerLargeTitle: true,
					...modal,
				}}
			/>
			{technician ? (
				<>
					<ScrollView
						contentInsetAdjustmentBehavior="automatic"
						showsVerticalScrollIndicator={false}
						className="flex-1 bg-background"
					>
						<View className="flex-1 items-center justify-center p-4">
							<Text className="font-bold text-lg">{technician.name}</Text>
							<Text className="mt-2 text-center text-base">
								Email: {technician.email}
							</Text>
						</View>
					</ScrollView>
					<Button
						onPress={() => {}}
						className="absolute bottom-10 self-center overflow-hidden rounded-full"
					>
						<Button.Label>Create Transaction</Button.Label>
						<Ionicons name="add-outline" size={18} color={background} />
					</Button>
				</>
			) : (
				<View className="flex-1 items-center justify-center">
					<Text>Not Found</Text>
				</View>
			)}
		</>
	);
}
