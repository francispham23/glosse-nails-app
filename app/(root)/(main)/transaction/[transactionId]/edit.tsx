import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { HeaderButton } from "@/components/Buttons/header-button";
import {
	type SelectedInput,
	TransactionForm,
} from "@/components/TransactionForm";
import {
	TransactionSaveFeedback,
	useTransactionSave,
} from "@/components/transaction-save-feedback";
import { useWebRouteDismiss } from "@/contexts/web-route-dismiss-context";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useAuthorization } from "@/hooks/use-authorization";
import type { EarningFormState, PaymentMethod, Transaction } from "@/utils";

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
	const router = useRouter();
	const transactionId = transaction._id;
	const updateTransaction = useMutation(api.transactions.updateTransaction);
	const [open, setOpen] = useState(false);
	const feedback = useTransactionSave();
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

	const { isLockedNow, isLocked } = feedback;
	const { setDismissDisabled } = useWebRouteDismiss();
	useEffect(() => {
		setDismissDisabled(isLocked);
		return () => setDismissDisabled(false);
	}, [isLocked, setDismissDisabled]);
	const changeEarning = useCallback<typeof setEarning>(
		(update) => {
			if (!isLockedNow()) setEarning(update);
		},
		[isLockedNow],
	);
	const changeSelectedInputs = useCallback<typeof setSelectedInputs>(
		(update) => {
			if (!isLockedNow()) setSelectedInputs(update);
		},
		[isLockedNow],
	);
	const changeOpen = useCallback(
		(value: boolean) => {
			if (!isLockedNow()) setOpen(value);
		},
		[isLockedNow],
	);
	const headerOptions = useMemo(
		() => ({
			headerLeft: () => (
				<HeaderButton
					iconName="close"
					disabled={isLocked}
					isBlocked={isLockedNow}
				/>
			),
		}),
		[isLocked, isLockedNow],
	);

	/* ----------------------------- handle edit transaction ----------------------------- */
	const handleSubmit = () =>
		feedback.save(
			async () => {
				const tip = earning.tip.length > 0 ? earning.tip : "0";
				await updateTransaction({
					id: transactionId,
					body: { ...earning, tip },
				});
			},
			{
				blockedMessage: giftError,
				successMessage: "Transaction updated successfully",
				fallback: "Failed to update transaction. Please try again.",
				onSuccess: () => {
					if (router.canGoBack()) router.back();
					else router.replace("/earnings");
				},
			},
		);

	return (
		<>
			<Stack.Screen options={headerOptions} />
			<TransactionForm
				type="edit"
				earning={earning}
				setEarning={changeEarning}
				onSubmit={handleSubmit}
				saveError={feedback.error}
				submitDisabled={feedback.isLocked}
				isLoading={feedback.isSaving}
				submitLabel={feedback.isSaving ? "Updating..." : "Update"}
				open={open}
				setOpen={changeOpen}
				giftError={giftError}
				setGiftError={setGiftError}
				title={"Edit Transaction"}
				description="Update transaction details"
				transactionId={transactionId as Transaction["_id"]}
				selectedInputs={selectedInputs}
				setSelectedInputs={changeSelectedInputs}
				isAuthorized={isAuthorized}
			/>
			<TransactionSaveFeedback
				message={feedback.success}
				onReturn={feedback.returnToPreviousScreen}
			/>
		</>
	);
}
