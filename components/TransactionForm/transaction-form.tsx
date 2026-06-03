import { useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { Keyboard } from "react-native";
import { Button } from "react-native-paper";

import { DeleteButton } from "@/components/Buttons/delete-button";
import type { otherInputs } from "@/components/Form/constants";
import FormHeader from "@/components/Form/form";
import { getPaymentPlaceholder } from "@/components/Form/helpers";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ServiceCategoryChips } from "@/components/TransactionForm/form-chips";

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

import { CompensationSection } from "./compensation-section";
import { OthersSection } from "./others-section";
import { ServiceTimePicker } from "./service-time-picker";
import { TipSection } from "./tip-section";

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
			<CompensationSection
				compensation={compensation}
				compInCash={compInCash}
				compInGift={compInGift}
				cash={cash}
				card={card}
				gift={gift}
				compensationMethods={compensationMethods}
				compensationPlaceholder={compensationPlaceholder}
				mutedColor={mutedColor}
				earning={earning}
				updateEarning={updateEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				getFieldError={getFieldError}
				onSelectCompensationMethod={handleSelectCompensationMethod}
			/>

			{/* Tip */}
			<TipSection
				tip={tip}
				tipInCash={tipInCash}
				tipInGift={tipInGift}
				compInGift={compInGift}
				tipCash={tipCash}
				tipCard={tipCard}
				tipGift={tipGift}
				tipMethods={tipMethods}
				tipPlaceholder={tipPlaceholder}
				mutedColor={mutedColor}
				earning={earning}
				updateEarning={updateEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				getFieldError={getFieldError}
				onSelectTipMethod={handleSelectTipMethod}
			/>

			{/* Others */}
			<OthersSection
				showSupply={showSupply}
				showDiscount={showDiscount}
				isCashSupply={isCashSupply}
				isCashDiscount={isCashDiscount}
				supply={supply}
				discount={discount}
				updateEarning={updateEarning}
				mutedColor={mutedColor}
				getFieldError={getFieldError}
				selectedInputs={selectedInputs}
				setSelectedInputs={setSelectedInputs}
				earning={earning}
			/>

			{/* Service Time Picker */}
			<ServiceTimePicker
				serviceDate={serviceDate}
				open={open}
				setOpen={setOpen}
				endOfDay={endOfDay}
				mutedColor={mutedColor}
				onDateChange={handleDateChange}
			/>

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
