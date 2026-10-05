import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { HeaderButton } from "@/components/Buttons/header-button";

import { initialEarningState } from "@/components/Form/constants";
import {
	type SelectedInput,
	TransactionForm,
} from "@/components/TransactionForm";
import {
	TransactionSaveFeedback,
	useTransactionSave,
} from "@/components/transaction-save-feedback";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { type EarningFormState, isToday, type User } from "@/utils";

export default function CreateRoute() {
	const router = useRouter();
	const { midDay } = useAppDate();

	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});
	const addTransaction = useMutation(api.transactions.addTransaction);

	/* ---------------------------------- state --------------------------------- */
	const [open, setOpen] = useState(false);
	const [giftError, setGiftError] = useState("");
	const feedback = useTransactionSave();
	const [selectedInputs, setSelectedInputs] = useState<SelectedInput[]>([
		"Supply",
	]);

	const createInitialEarning = (): EarningFormState => ({
		...initialEarningState,
		technicianId,
		// TODO: allow selecting client ID later
		clientId: technicianId, // Default client ID
		serviceDate: isToday(midDay.getTime()) ? Date.now() : midDay.getTime(),
	});
	const [earning, setEarning] =
		useState<EarningFormState>(createInitialEarning);

	const { isLockedNow, isLocked } = feedback;
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
			headerRight: () => (
				<HeaderButton
					iconName="swap-horizontal-outline"
					route={`/technician/${technicianId}`}
					disabled={isLocked}
					isBlocked={isLockedNow}
				/>
			),
		}),
		[isLocked, isLockedNow, technicianId],
	);

	/* ----------------------------- handle create transaction ----------------------------- */
	const handleSubmit = () =>
		feedback.save(
			async () => {
				const tip = earning.tip.length > 0 ? earning.tip : "0";
				await addTransaction({ body: { ...earning, tip } });
			},
			{
				blockedMessage: giftError,
				successMessage: "Earning saved successfully",
				fallback: "Failed to save earning. Please try again.",
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
				type="create"
				earning={earning}
				setEarning={changeEarning}
				onSubmit={handleSubmit}
				saveError={feedback.error}
				submitDisabled={feedback.isLocked}
				isLoading={feedback.isSaving}
				submitLabel={feedback.isSaving ? "Submitting Earning..." : "Submit"}
				open={open}
				setOpen={changeOpen}
				giftError={giftError}
				setGiftError={setGiftError}
				title={`${technician?.name?.split(" ")[0]}'s Earning`}
				description="Add a new earning for this technician"
				selectedInputs={selectedInputs}
				setSelectedInputs={changeSelectedInputs}
			/>
			<TransactionSaveFeedback
				message={feedback.success}
				onReturn={feedback.returnToPreviousScreen}
			/>
		</>
	);
}
