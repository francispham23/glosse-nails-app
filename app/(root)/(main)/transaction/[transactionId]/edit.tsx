import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import {
	type SelectedInput,
	TransactionForm,
} from "@/components/TransactionForm";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAuthorization } from "@/hooks/use-authorization";
import {
	type EarningFormState,
	getErrorMessage,
	type PaymentMethod,
	type Transaction,
} from "@/utils";

export default function EditTransactionScreen() {
	const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
	const { isAuthorized } = useAuthorization();

	const transaction = useQuery(
		api.transactions.getById,
		transactionId ? { id: transactionId as Transaction["_id"] } : "skip",
	);
	const giftCards = useQuery(api.giftCards.list);
	const giftCode = transaction?.giftCode
		? giftCards?.find((gc) => gc._id === transaction.giftCode)?.code || ""
		: "";

	if (!transaction || (transaction.giftCode && giftCards === undefined)) {
		return <ActivityIndicator className="flex-1 items-center justify-center" />;
	}
	return (
		<LoadedEditForm
			key={transaction._id}
			transaction={transaction}
			giftCode={giftCode}
			isAuthorized={isAuthorized}
		/>
	);
}

function LoadedEditForm({
	transaction,
	giftCode,
	isAuthorized,
}: {
	transaction: Doc<"transactions">;
	giftCode: string;
	isAuthorized: boolean;
}) {
	const transactionId = transaction._id;
	const updateTransaction = useMutation(api.transactions.updateTransaction);
	const [open, setOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [giftError, setGiftError] = useState("");
	const [selectedInputs, setSelectedInputs] = useState<SelectedInput[]>(() => [
		...(transaction.discount ? ["Discount" as const] : []),
		...(transaction.supply ? ["Supply" as const] : []),
	]);
	const [earning, setEarning] = useState<EarningFormState>(() => ({
		compensation: transaction.compensation.toString(),
		compInCash: transaction.compInCash?.toString() || "",
		compInGift: transaction.compInGift?.toString() || "",
		compensationMethods: transaction.compensationMethods as PaymentMethod[],
		tip: transaction.tip.toString(),
		tipInCash: transaction.tipInCash?.toString() || "",
		tipInGift: transaction.tipInGift?.toString() || "",
		tipMethods: transaction.tipMethods as PaymentMethod[],
		discount: transaction.discount?.toString() || "",
		discountType: transaction.discountType || undefined,
		isCashDiscount: transaction.isCashDiscount || undefined,
		supply: transaction.supply?.toString() || "",
		isCashSupply: transaction.isCashSupply || undefined,
		giftCode: giftCode,
		services: transaction.services || [],
		technicianId: transaction.technician,
		clientId: transaction.client,
		serviceDate: transaction.serviceDate ?? Date.now(),
	}));

	/* ----------------------------- handle edit transaction ----------------------------- */
	const handleSubmit = async () => {
		if (giftError) {
			Alert.alert("Error", giftError);
			return;
		}

		if (!transaction || !transactionId) return;

		try {
			setIsUpdating(true);
			const tip = earning.tip.length > 0 ? earning.tip : "0";
			await updateTransaction({
				id: transactionId as Transaction["_id"],
				body: { ...earning, tip },
			});

			Alert.alert("Success", "Transaction updated successfully", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert(
				"Error",
				getErrorMessage(error, "Failed to update transaction"),
			);
			console.error("Failed to update transaction:", error);
		} finally {
			setIsUpdating(false);
			setOpen(false);
			setGiftError("");
		}
	};

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
			transactionId={transactionId as Transaction["_id"]}
			selectedInputs={selectedInputs}
			setSelectedInputs={setSelectedInputs}
			isAuthorized={isAuthorized}
		/>
	);
}
