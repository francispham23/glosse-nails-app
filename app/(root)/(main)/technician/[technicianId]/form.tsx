import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, View } from "react-native";

import FormHeader, { FormContainer } from "@/components/form";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { storeEarningForCheckout } from "@/utils/transaction-storage";
import type { Category, EarningFormState, User } from "@/utils/types";

export default function FormRoute() {
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const router = useRouter();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});
	const categories = useQuery(api.categories.getAllCategories);

	const { date, endOfDay } = useAppDate();

	/* ---------------------------------- state --------------------------------- */
	const initialEarningState = {
		compensation: "",
		tip: "",
		technicianId,
		services: [] as Category["_id"][],
		// TODO: allow selecting client ID later
		clientId: technicianId, // Default client ID
	};
	const [earning, setEarning] = useState<EarningFormState>({
		...initialEarningState,
		serviceDate: date.getTime(),
	});
	const [open, setOpen] = useState(false);
	const [isLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter your earning");
			return;
		}

		try {
			// Store earning in AsyncStorage for later bulk insertion at checkout
			await storeEarningForCheckout(earning);

			setEarning({ ...initialEarningState, serviceDate: Date.now() });
			Alert.alert("Success", "Earning saved successfully");
			router.push(`/technician/${technicianId}`);
		} catch (error) {
			console.error("Error storing earning:", error);
			Alert.alert("Error", "Failed to save earning. Please try again.");
		}
	};

	const handleSelectServices = (categoryId: Category["_id"]) =>
		setEarning((prev) => {
			const services = prev.services.includes(categoryId)
				? prev.services.filter((id) => id !== categoryId)
				: [...prev.services, categoryId];
			return { ...prev, services };
		});

	return (
		<FormContainer>
			{/* header */}
			<FormHeader
				title={`${technician?.name?.split(" ")[0]}'s Earning`}
				description="Add a new earning for this technician"
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
			{/* service time field */}
			<TextField>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Select service time"
					value={new Date(earning.serviceDate).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
					editable={false}
					onPressIn={() => setOpen(!open)}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="time-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{open && (
				<DateTimePicker
					mode="time"
					value={new Date(earning.serviceDate)}
					maximumDate={endOfDay}
					display="spinner"
					onChange={(_, selectedDate) => {
						setEarning({
							...earning,
							serviceDate: selectedDate
								? selectedDate.getTime()
								: date.getTime(),
						});
					}}
				/>
			)}
			{/* service categories */}
			<View className="flex-row flex-wrap gap-2">
				{categories?.map((category) => (
					<Chip
						key={category._id}
						variant={
							earning.services.includes(category._id) ? "primary" : "secondary"
						}
						onPress={() => handleSelectServices(category._id)}
					>
						<Chip.Label>{category.name}</Chip.Label>
					</Chip>
				))}
			</View>
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
