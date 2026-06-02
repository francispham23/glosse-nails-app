import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { Keyboard, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { type otherInputs, paymentMethods } from "@/components/Form/constants";
import FormHeader, { ErrorText } from "@/components/Form/form";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import { getPaymentPlaceholder } from "@/components/Form/helpers";
import { NumericInput } from "@/components/Form/numeric-input";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import {
	OtherInputChips,
	PaymentMethodChips,
	ServiceCategoryChips,
} from "@/components/TransactionForm/form-chips";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { useFormValidation } from "@/hooks";
import {
	type Category,
	EarningFormSchema,
	type EarningFormState,
	type PaymentMethod,
	type Transaction,
	useThemeColor,
} from "@/utils";
import { DeleteButton } from "../Buttons/delete-button";

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
	selectedInputs: SelectedInput[];
	setSelectedInputs: React.Dispatch<React.SetStateAction<SelectedInput[]>>;
	isAuthorized?: boolean;
	transactionId?: Transaction["_id"];
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
	isAuthorized,
}: TransactionFormProps) {
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();
	const {
		discount,
		supply,
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
		giftCode,
		compInGift,
		tipInGift,
	} = earning;

	const categories = useQuery(api.categories.getFormCategories);

	// Fetch gift card details and calculate balance if gift code is entered
	const normalizedGiftCode = giftCode?.trim() ?? "";
	const giftCard = useQuery(
		api.giftCards.getByCode,
		normalizedGiftCode ? { code: normalizedGiftCode, transactionId } : "skip",
	);

	/* ---------------------------------- State --------------------------------- */
	const { errors, validate, getFieldError } =
		useFormValidation(EarningFormSchema);

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
			(!!normalizedGiftCode && !giftCard) ||
			!compensationPlaceholder,
		[
			isLoading,
			errors,
			giftError,
			normalizedGiftCode,
			giftCard,
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
			const newServices = services.includes(categoryId)
				? services.filter((id) => id !== categoryId)
				: [...services, categoryId];

			setEarning((prev) => {
				const newEarning = { ...prev, services: newServices };
				validate(newEarning);
				return newEarning;
			});
		},
		[services, validate, setEarning],
	);

	const handleSelectCompensationMethod = useCallback(
		(method: PaymentMethod) => {
			if (compensationMethods.length === 1) {
				if (compensationMethods[0] === method) return; // Prevent deselecting the last method
				if (compensationMethods[0] === "Card" && method === "Cash") {
					setEarning((prev) => ({
						...prev,
						compensationMethods: ["Cash"],
						tipMethods: ["Cash"],
						isCashDiscount: true,
						isCashSupply: true,
					}));
					return;
				}
			}
			const newMethods = compensationMethods.includes(method)
				? compensationMethods.filter((m) => m !== method)
				: [...compensationMethods, method];
			setEarning((prev) => {
				const newEarning = {
					...prev,
					compensationMethods: newMethods,
					isCashDiscount: newMethods.includes("Cash"),
					isCashSupply: newMethods.includes("Cash"),
				};
				validate(newEarning);
				return newEarning;
			});
		},
		[validate, setEarning, compensationMethods],
	);

	const handleSelectTipMethod = useCallback(
		(method: PaymentMethod) => {
			if (
				tipMethods.length === 1 &&
				tipMethods[0] === "Card" &&
				method === "Cash"
			) {
				setEarning((prev) => ({
					...prev,
					tipMethods: ["Cash"],
				}));
				return;
			}
			const newMethods = tipMethods.includes(method)
				? tipMethods.filter((m) => m !== method)
				: [...tipMethods, method];

			setEarning((prev) => {
				const newEarning = {
					...prev,
					tipMethods: newMethods,
					isCashDiscount: newMethods.includes("Cash"),
					isCashSupply: newMethods.includes("Cash"),
				};
				validate(newEarning);
				return newEarning;
			});
		},
		[tipMethods, validate, setEarning],
	);

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
				{!compensationPlaceholder ? (
					<Text className="px-4 text-red-500 text-sm">
						Please select at least one compensation method
					</Text>
				) : null}
				{/* Cash Amount (when both Cash and Card selected) */}
				{cash && card ? (
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
				) : null}
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
					disableGift={!!compInGift} // Disable selecting Gift Card for compensation if gift card usage for compensation already has a value
				/>
			</View>

			{/* Tip */}
			<View className="flex gap-2">
				{tipMethods.length > 0 ? (
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
						{tipCash && tipCard ? (
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
						) : null}
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
				) : null}
				{/* Tip Methods */}
				<PaymentMethodChips
					methods={paymentMethods}
					selectedMethods={tipMethods}
					onSelect={handleSelectTipMethod}
					disableGift={compInGift === "" || !!tipInGift} // Disable selecting Gift Card for tip if no gift card usage for compensation
				/>
			</View>

			{/* Others */}
			<View className="flex gap-2">
				{/* Supply Input */}
				{showSupply ? (
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
				) : null}
				{/* Discount Input */}
				{showDiscount ? (
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
				) : null}
				{/* Other Input Toggles */}
				<OtherInputChips
					selectedInputs={selectedInputs}
					setSelectedInputs={setSelectedInputs}
					earning={earning}
				/>
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

			{open ? (
				<DateTimePicker
					mode="time"
					value={new Date(serviceDate)}
					maximumDate={endOfDay}
					display="spinner"
					onChange={handleDateChange}
				/>
			) : null}

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
			{type === "edit" && isAuthorized ? (
				<DeleteButton
					type="transactions"
					id={transactionId}
					isDisabled={isDisabled}
				/>
			) : null}
		</ScreenScrollView>
	);
}
