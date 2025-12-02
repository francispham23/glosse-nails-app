import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert } from "react-native";

import FormHeader, { FormContainer } from "@/components/form";
import { api } from "@/convex/_generated/api";
import type { User } from "@/utils/types";

export default function FormRoute() {
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const router = useRouter();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});
	const addTransaction = useMutation(api.transactions.addTransaction);

	/* ---------------------------------- state --------------------------------- */
	const initialEarningState = {
		compensation: "",
		tip: "",
		technicianId,
		clientId: undefined,
		services: [],
	};
	const [earning, setEarning] = useState(initialEarningState);
	const [isLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter your earning");
			return;
		}
		await addTransaction({ body: earning });
		setEarning(initialEarningState);
		Alert.alert("Success", "Earning submitted successfully");
		router.push(`/technician/${technicianId}`);
	};

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
