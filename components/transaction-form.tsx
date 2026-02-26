import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";
import { Button, Chip, TextInput } from "react-native-paper";

import { otherInputs, paymentMethods } from "@/components/Form/constants";
import FormHeader, { ErrorText } from "@/components/Form/form";
import {
	PaymentMethodChips,
	ServiceCategoryChips,
} from "@/components/Form/form-chips";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { getPaymentPlaceholder } from "@/components/Form/helpers";
import { NumericInput } from "@/components/Form/numeric-input";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useThemeColor } from "@/utils";
import type { Category, EarningFormState, PaymentMethod } from "@/utils/types";
import { EarningFormSchema } from "@/utils/validation";

/* ---------------------------------- Types --------------------------------- */
export type SelectedInput = (typeof otherInputs)[number];

interface TransactionFormProps {
	type: "create" | "edit";
	title: string;
	description: string;
	earning: EarningFormState;
	setEarning: React.Dispatch<React.SetStateAction<EarningFormState>>;
	onSubmit: () => void;
	isLoading: boolean;
	submitLabel: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	giftError: string;
	setGiftError: React.Dispatch<React.SetStateAction<string>>;
	transactionId?: Id<"transactions">;
	selectedInputs: SelectedInput[];
	setSelectedInputs: React.Dispatch<React.SetStateAction<SelectedInput[]>>;
}

/* ------------------------------- Main Component ------------------------------ */
export function TransactionForm({
	type,
	title,
	description,
	earning,
	setEarning,
	onSubmit,
	isLoading,
	submitLabel,
	open,
	setOpen,
	giftError,
	setGiftError,
	transactionId,
	selectedInputs,
	setSelectedInputs,
}: TransactionFormProps) {
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();
	const {
		discount,
		supply,
		giftCode,
		compensationMethods,
		tipMethods,
		serviceDate,
		compensation,
		tip,
		compInCash,
		tipInCash,
		services,
		isCashSupply,
		isCashDiscount,
	} = earning;

	const deleteTransaction = useMutation(api.transactions.deleteTransaction);
	const categories = useQuery(api.categories.getFormCategories);
	const giftCard = useQuery(api.giftCards.getByCode, {
		code: giftCode ? giftCode : "skip",
		transactionId,
	});

	/* ---------------------------------- State --------------------------------- */
	const { errors, validate, getFieldError } =
		useFormValidation(EarningFormSchema);
	const [isDeleting, setIsDeleting] = useState(false);

	/* ----------------------------- Derived State ------------------------------ */
	const { cash, card, gift, tipCash, tipCard, tipGift } = useMemo(
		() => ({
			cash: compensationMethods.includes("Cash"),
			card: compensationMethods.includes("Card"),
			gift: compensationMethods.includes("Gift Card"),
			tipCash: tipMethods.includes("Cash"),
			tipCard: tipMethods.includes("Card"),
			tipGift: tipMethods.includes("Gift Card"),
		}),
		[compensationMethods, tipMethods],
	);

	const showSupply = selectedInputs.includes("Supply");
	const showDiscount = selectedInputs.includes("Discount");

	const compensationPlaceholder = getPaymentPlaceholder(card, cash, gift);
	const tipPlaceholder = getPaymentPlaceholder(tipCard, tipCash, tipGift, true);

	const isDisabled = useMemo(
		() =>
			isLoading ||
			Object.keys(errors).length > 0 ||
			!!giftError ||
			(!!giftCode && !giftCard) ||
			isDeleting ||
			!compensationPlaceholder,
		[
			isLoading,
			errors,
			giftError,
			giftCode,
			giftCard,
			isDeleting,
			compensationPlaceholder,
		],
	);

	/* ------------------------------- Handlers --------------------------------- */
	const updateEarning = useCallback(
		<K extends keyof EarningFormState>(key: K, value: EarningFormState[K]) => {
			const newEarning = { ...earning, [key]: value };
			validate(newEarning);
			setEarning(newEarning);
		},
		[earning, validate, setEarning],
	);

	const handleSelectServices = useCallback(
		(categoryId: Category["_id"]) => {
			const newServices = earning.services.includes(categoryId)
				? earning.services.filter((id) => id !== categoryId)
				: [...earning.services, categoryId];
			const newEarning = { ...earning, services: newServices };
			validate(newEarning);
			setEarning(newEarning);
		},
		[earning, validate, setEarning],
	);

	const handleSelectCompensationMethod = useCallback(
		(method: PaymentMethod) => {
			if (earning.compensationMethods.length === 1) {
				if (earning.compensationMethods[0] === method) return; // Prevent deselecting the last method
				if (earning.compensationMethods[0] === "Card" && method === "Cash") {
					setEarning({
						...earning,
						compensationMethods: ["Cash"],
						tipMethods: ["Cash"],
						isCashDiscount: true,
						isCashSupply: true,
					});
					return;
				}
			}
			const newMethods = earning.compensationMethods.includes(method)
				? earning.compensationMethods.filter((m) => m !== method)
				: [...earning.compensationMethods, method];
			const newEarning = {
				...earning,
				compensationMethods: newMethods,
				isCashDiscount: newMethods.includes("Cash"),
				isCashSupply: newMethods.includes("Cash"),
			};
			validate(newEarning);
			setEarning(newEarning);
		},
		[earning, validate, setEarning],
	);

	const handleSelectTipMethod = useCallback(
		(method: PaymentMethod) => {
			if (
				earning.tipMethods.length === 1 &&
				earning.tipMethods[0] === "Card" &&
				method === "Cash"
			) {
				setEarning({
					...earning,
					tipMethods: ["Cash"],
				});
				return;
			}
			const newMethods = earning.tipMethods.includes(method)
				? earning.tipMethods.filter((m) => m !== method)
				: [...earning.tipMethods, method];
			const newEarning = {
				...earning,
				tipMethods: newMethods,
				isCashDiscount: newMethods.includes("Cash"),
				isCashSupply: newMethods.includes("Cash"),
			};
			validate(newEarning);
			setEarning(newEarning);
		},
		[earning, validate, setEarning],
	);

	const toggleInput = useCallback(
		(input: SelectedInput) => {
			setSelectedInputs((prev) =>
				prev.includes(input)
					? prev.filter((i) => i !== input)
					: [...prev, input],
			);
		},
		[setSelectedInputs],
	);

	const handleDelete = useCallback(async () => {
		if (!transactionId) return;

		Alert.alert(
			"Delete Transaction",
			"Are you sure you want to delete this transaction? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);
							await deleteTransaction({ id: transactionId });
							Alert.alert("Success", "Transaction deleted successfully", [
								{ text: "OK", onPress: () => router.back() },
							]);
						} catch (error) {
							Alert.alert("Error", "Failed to delete transaction");
							console.error("Failed to delete transaction:", error);
						} finally {
							setIsDeleting(false);
						}
					},
				},
			],
		);
	}, [transactionId, deleteTransaction]);

	const handleValidateAndSubmit = useCallback(() => {
		if (validate(earning)) {
			onSubmit();
		}
	}, [validate, earning, onSubmit]);

	const handleDateChange = useCallback(
		(_: unknown, selectedDate: Date | undefined) => {
			updateEarning("serviceDate", selectedDate?.getTime() ?? serviceDate);
		},
		[updateEarning, serviceDate],
	);

	/* --------------------------------- Render --------------------------------- */
	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			<FormHeader title={title} description={description} />

			{/* Compensation */}
			<View className="flex gap-2">
				{/* Compensation Input */}
				<NumericInput
					placeholder={compensationPlaceholder || "Select Compensation Methods"}
					value={compensation.toString()}
					onChangeText={(value) => updateEarning("compensation", value)}
					icon="credit-card-outline"
					iconColor={mutedColor}
				/>
				<ErrorText error={getFieldError("compensation")} />
				{!compensationPlaceholder && (
					<Text className="px-4 text-red-500 text-sm">
						Please select at least one compensation method
					</Text>
				)}
				{/* Cash Amount (when both Cash and Card selected) */}
				{cash && card && (
					<>
						<NumericInput
							placeholder="Enter Cash Amount"
							value={compInCash?.toString()}
							onChangeText={(value) => updateEarning("compInCash", value)}
							icon="cash-multiple"
							iconColor={mutedColor}
						/>
						<ErrorText error={getFieldError("compInCash")} />
					</>
				)}
				{/* Gift Card Inputs for Compensation */}
				<GiftCardInputs
					earning={earning}
					updateEarning={updateEarning}
					giftCard={giftCard}
					giftError={giftError}
					setGiftError={setGiftError}
					type={gift ? "compInGift" : undefined}
				/>
				<ErrorText error={getFieldError("compInGift")} />
				{/* Compensation Methods */}
				<PaymentMethodChips
					methods={paymentMethods}
					selectedMethods={compensationMethods}
					onSelect={handleSelectCompensationMethod}
				/>
			</View>

			{/* Tip */}
			<View className="flex gap-2">
				{tipMethods.length > 0 && (
					<>
						{/* Tip Input */}
						<NumericInput
							placeholder={tipPlaceholder || "Select Tip Methods"}
							value={tip === "0" ? "" : tip.toString()}
							onChangeText={(value) => updateEarning("tip", value)}
							icon="credit-card-outline"
							iconColor={mutedColor}
						/>
						<ErrorText error={getFieldError("tip")} />
						{tipCash && tipCard && (
							<>
								<NumericInput
									placeholder="Enter Tip in Cash Amount"
									value={tipInCash?.toString()}
									onChangeText={(value) => updateEarning("tipInCash", value)}
									icon="cash-multiple"
									iconColor={mutedColor}
								/>
								<ErrorText error={getFieldError("tipInCash")} />
							</>
						)}
						{/* Gift Card Inputs for Tip */}
						<GiftCardInputs
							earning={earning}
							updateEarning={updateEarning}
							giftCard={giftCard}
							giftError={giftError}
							setGiftError={setGiftError}
							type={tipGift ? "tipInGift" : undefined}
						/>
						<ErrorText error={getFieldError("tipInGift")} />
					</>
				)}
				{/* Tip Methods */}
				<PaymentMethodChips
					methods={paymentMethods}
					selectedMethods={tipMethods}
					onSelect={handleSelectTipMethod}
					disableGift={earning.compInGift === ""} // Disable selecting Gift Card for tip if no gift card usage for compensation
				/>
			</View>

			{/* Others */}
			<View className="flex gap-2">
				{/* Supply Input */}
				{showSupply && (
					<>
						<NumericInput
							placeholder={`Enter ${isCashSupply ? "Cash" : ""} Supply Cost`}
							value={supply?.toString()}
							onChangeText={(value) => updateEarning("supply", value)}
							icon="package-variant"
							iconColor={mutedColor}
						/>
						<ErrorText error={getFieldError("supply")} />
					</>
				)}
				{/* Discount Input */}
				{showDiscount && (
					<>
						<NumericInput
							placeholder={`Enter ${isCashDiscount ? "Cash" : ""} Discount Amount`}
							value={discount?.toString()}
							onChangeText={(value) => updateEarning("discount", value)}
							icon="cash-minus"
							iconColor={mutedColor}
						/>
						<ErrorText error={getFieldError("discount")} />
					</>
				)}
				{/* Other Input Toggles */}
				<View className="flex-row flex-wrap gap-2">
					{otherInputs.map((input) => (
						<Chip
							key={input}
							selected={selectedInputs.includes(input)}
							disabled={
								selectedInputs.includes(input) &&
								earning[input.toLocaleLowerCase() as keyof EarningFormState] !==
									""
							}
							className={
								selectedInputs.includes(input) ? "opacity-60" : "opacity-100"
							}
							onPress={() => toggleInput(input)}
						>
							{input}
						</Chip>
					))}
				</View>
			</View>

			{/* Service Time Picker */}
			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder="Select service time"
				value={new Date(serviceDate).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={
					<TextInput.Icon icon="clock-outline" size={22} color={mutedColor} />
				}
			/>

			{open && (
				<DateTimePicker
					mode="time"
					value={new Date(serviceDate)}
					maximumDate={endOfDay}
					display="spinner"
					onChange={handleDateChange}
				/>
			)}

			{/* Service Categories */}
			<ServiceCategoryChips
				categories={categories}
				selectedServices={services}
				onSelect={handleSelectServices}
			/>

			{/* Submit Button */}
			<Button
				onPress={handleValidateAndSubmit}
				disabled={isDisabled}
				loading={isLoading}
				mode="contained"
				className="rounded-3xl"
			>
				{submitLabel}
			</Button>

			{/* Delete Button (Edit mode only) */}
			{type === "edit" && (
				<Button
					onPress={handleDelete}
					disabled={isDisabled}
					loading={isDeleting}
					mode="contained"
					className="rounded-3xl"
					buttonColor="red"
				>
					Delete Transaction
				</Button>
			)}
		</ScreenScrollView>
	);
}
