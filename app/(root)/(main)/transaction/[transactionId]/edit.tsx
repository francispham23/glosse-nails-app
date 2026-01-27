import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { initialEarningState } from "@/components/form";
import { TransactionForm } from "@/components/transaction-form";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { EarningFormState, PaymentMethod, User } from "@/utils/types";

export default function EditTransactionScreen() {
	const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

	const transaction = useQuery(
		api.transactions.getById,
		transactionId ? { id: transactionId as Id<"transactions"> } : "skip",
	);
	const updateTransaction = useMutation(api.transactions.updateTransaction);
	const giftCards = useQuery(api.giftCards.list);
	const giftCode = transaction?.giftCode
		? giftCards?.find((gc) => gc._id === transaction.giftCode)?.code || ""
		: "";

	/* ---------------------------------- state --------------------------------- */
	const [open, setOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [giftError, setGiftError] = useState("");
	const [earning, setEarning] = useState<EarningFormState>({
		...initialEarningState,
		technicianId: "" as User["_id"],
		clientId: "" as User["_id"],
		serviceDate: Date.now(),
	});

	/* -------------- Populate form when transaction loads -------------- */
	useEffect(() => {
		if (transaction) {
			setEarning({
				compensation: transaction.compensation.toString(),
				compInCash: transaction.compInCash?.toString() || "",
				compInGift: transaction.compInGift?.toString() || "",
				compensationMethods: transaction.compensationMethods as PaymentMethod[],
				tip: transaction.tip.toString(),
				tipInCash: transaction.tipInCash?.toString() || "",
				tipInGift: transaction.tipInGift?.toString() || "",
				tipMethods: transaction.tipMethods as PaymentMethod[],
				discount: transaction.discount?.toString() || "",
				supply: transaction.supply?.toString() || "",
				giftCode: giftCode,
				services: transaction.services || [],
				technicianId: transaction.technician,
				clientId: transaction.client,
				serviceDate: transaction.serviceDate || Date.now(),
			});
		}
	}, [transaction, giftCode]);

	/* ----------------------------- handle edit transaction ----------------------------- */
	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter compensation");
			return;
		}

		if (giftError) {
			Alert.alert("Error", giftError);
			return;
		}

		if (!transaction || !transactionId) return;

		try {
			setIsUpdating(true);
			const tip = earning.tip.length > 0 ? earning.tip : "0";
			await updateTransaction({
				id: transactionId as Id<"transactions">,
				body: { ...earning, tip },
			});

			Alert.alert("Success", "Transaction updated successfully", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert("Error", "Failed to update transaction");
			console.error("Failed to update transaction:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	if (!transaction) {
		return (
			<View className="flex-1 items-center justify-center">
				<Spinner size="lg" />
			</View>
		);
	}

	return (
		<TransactionForm
			type="edit"
			earning={earning}
			setEarning={setEarning}
			onSubmit={handleSubmit}
			isLoading={isUpdating}
			submitLabel={isUpdating ? "Updating..." : "Update"}
			open={open}
			setOpen={setOpen}
			giftError={giftError}
			setGiftError={setGiftError}
			title={"Edit Transaction"}
			description="Update transaction details"
			transactionId={transactionId as Id<"transactions">}
		/>
	);
}
