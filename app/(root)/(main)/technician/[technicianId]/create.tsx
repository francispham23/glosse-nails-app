import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { initialEarningState } from "@/components/Form/constants";
import { TransactionForm } from "@/components/transaction-form";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { EarningFormState, User } from "@/utils/types";

export default function CreateRoute() {
	const router = useRouter();
	const { date } = useAppDate();

	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});
	const addTransaction = useMutation(api.transactions.addTransaction);

	/* ---------------------------------- state --------------------------------- */
	const [open, setOpen] = useState(false);
	const [giftError, setGiftError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [earning, setEarning] = useState<EarningFormState>({
		...initialEarningState,
		technicianId,
		// TODO: allow selecting client ID later
		clientId: technicianId, // Default client ID
		serviceDate: date.getTime(),
	});

	/* ----------------------------- handle create transaction ----------------------------- */
	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter your earning");
			return;
		}

		if (giftError) {
			Alert.alert("Error", giftError);
			return;
		}

		try {
			setIsLoading(true);
			// Store earning in Convex
			const tip = earning.tip.length > 0 ? earning.tip : "0";
			await addTransaction({ body: { ...earning, tip } });

			setEarning({
				...initialEarningState,
				technicianId,
				// TODO: allow selecting client ID later
				clientId: technicianId, // Default client ID
				serviceDate: Date.now(),
			});
			Alert.alert("Success", "Earning saved successfully");
			router.push(`/technician/${technicianId}`);
		} catch (error) {
			console.error("Error storing earning:", error);
			Alert.alert("Error", "Failed to save earning. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<TransactionForm
			type="create"
			earning={earning}
			setEarning={setEarning}
			onSubmit={handleSubmit}
			isLoading={isLoading}
			submitLabel={isLoading ? "Submitting Earning..." : "Submit"}
			open={open}
			setOpen={setOpen}
			giftError={giftError}
			setGiftError={setGiftError}
			title={`${technician?.name?.split(" ")[0]}'s Earning`}
			description="Add a new earning for this technician"
		/>
	);
}
