import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Text } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

import FormHeader, { FormContainer } from "@/components/form";
import { TransactionCard } from "@/components/transaction-card";
import { api } from "@/convex/_generated/api";
import type { Transaction, User } from "@/utils/types";

export default function TechnicianDetail() {
	const params = useLocalSearchParams();
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});

	/* ---------------------------------- state --------------------------------- */
	const [openForm, setOpenForm] = useState(true);
	const [earning, setEarning] = useState({
		compensation: "",
		tip: "",
		technicianId,
	});

	const transactions = useQuery(api.transactions.list, {
		userId: technicianId,
	});
	const addTransaction = useMutation(api.transactions.addTransaction);

	const [isLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSubmit = async () => {
		/**
		 * FEAT: Add your own form validation validation here
		 * i've been using tanstack form for react native with zod
		 *
		 * but this is just a base for you to get started
		 */
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter your earning");
			return;
		}
		addTransaction({ body: earning });
		console.log("Earning submitted:", earning);
		setOpenForm(false);
	};

	/* --------------------------------- return --------------------------------- */
	// TODO: Fix transaction update when adding new transaction
	if (!openForm && transactions) {
		return (
			<Animated.View
				className="flex-1 gap-2 px-6 pt-18"
				entering={FadeIn}
				exiting={FadeOut}
			>
				<Text className="font-extrabold text-3xl text-foreground">
					{transactions[0].technician}
				</Text>
				<Animated.FlatList
					contentInsetAdjustmentBehavior="automatic"
					contentContainerClassName="gap-4 pt-2 px-3 pb-24"
					data={transactions}
					renderItem={({ item }: { item: Transaction }) => {
						return (
							<TransactionCard transaction={item} technicianId={technicianId} />
						);
					}}
					keyExtractor={(item) => item._id.toString()}
					itemLayoutAnimation={LinearTransition}
					ListEmptyComponent={<Text>No Transaction</Text>}
				/>
				<Button
					onPress={() => setOpenForm(true)}
					className="absolute bottom-10 self-center overflow-hidden rounded-full"
				>
					<Button.Label>Create Transaction</Button.Label>
					<Ionicons name="add-outline" size={18} color={background} />
				</Button>
			</Animated.View>
		);
	}

	return (
		<FormContainer>
			{/* header */}
			<FormHeader
				title={`${technician?.name?.split(" ")[0]}'s Turn Earning`}
				description="Enter the earning you want to turn into transaction"
			/>

			{/* compensation text-field*/}
			<TextField isRequired className="focus">
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter compensation"
					keyboardType="numeric"
					autoCapitalize="none"
					autoFocus={true}
					value={earning.compensation.toString()}
					onChangeText={(value) =>
						setEarning({ ...earning, compensation: value })
					}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>

			{/* tip text-field*/}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter amount"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.tip.toString()}
					onChangeText={(value) => setEarning({ ...earning, tip: value })}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>

			{/* submit button */}
			<Button
				onPress={handleSubmit}
				isDisabled={isLoading}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>
					{isLoading ? "Submitting Earning..." : "Submit"}
				</Button.Label>
				{isLoading ? <Spinner color={background} /> : null}
			</Button>
		</FormContainer>
	);
}
