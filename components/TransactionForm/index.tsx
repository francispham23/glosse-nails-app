import { useQuery } from "convex/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Keyboard, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
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
import { clearHiddenPaymentAmounts } from "@/utils/financial-validation";
import { CompensationSection } from "./compensation-section";
import { OthersSection } from "./others-section";
import { ServiceTimePicker } from "./service-time-picker";
import { TipSection } from "./tip-section";

/* ---------------------------------- Types --------------------------------- */
export type UpdateEarning = <K extends keyof EarningFormState>(
	key: K,
	value: EarningFormState[K],
) => void;

export type SelectedInput = (typeof otherInputs)[number];

interface TransactionFormProps {
	type: "create" | "edit";
	title: string;
	description: string;
	earning: EarningFormState;
	setEarning: React.Dispatch<React.SetStateAction<EarningFormState>>;
	onSubmit: () => void;
	isLoading: boolean;
	submitDisabled?: boolean;
	saveError?: string;
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
	setEarning: changeEarning,
	onSubmit,
	isLoading,
	submitDisabled = false,
	saveError = "",
	submitLabel,
	open,
	setOpen: changeOpen,
	giftError,
	setGiftError,
	transactionId,
	selectedInputs,
	setSelectedInputs: changeSelectedInputs,
	isAuthorized,
}: TransactionFormProps) {
	const { colors } = useTheme();
	const headerHeight = useHeaderHeight();
	const draftLocked = isLoading || submitDisabled;
	const setEarning = useCallback<typeof changeEarning>(
		(update) => {
			if (!draftLocked) changeEarning(update);
		},
		[draftLocked, changeEarning],
	);
	const setSelectedInputs = useCallback<typeof changeSelectedInputs>(
		(update) => {
			if (!draftLocked) changeSelectedInputs(update);
		},
		[draftLocked, changeSelectedInputs],
	);
	const setOpen = (value: boolean) => {
		if (!draftLocked) changeOpen(value);
	};
	useEffect(() => {
		if (draftLocked || saveError) Keyboard.dismiss();
	}, [draftLocked, saveError]);
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();
	const { compensationMethods, tipMethods, serviceDate, services, giftCode } =
		earning;

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

	const compensationPlaceholder = getPaymentPlaceholder(card, cash, gift);

	const isDisabled = useMemo(
		() =>
			isLoading ||
			submitDisabled ||
			Object.keys(errors).length > 0 ||
			!!giftError ||
			(!!normalizedGiftCode && !giftCard) ||
			!compensationPlaceholder,
		[
			isLoading,
			submitDisabled,
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
			const newEarning = clearHiddenPaymentAmounts<EarningFormState>({
				...earning,
				[key]: value,
			});
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
				if (compensationMethods[0] === method) {
					return; // Prevent deselecting the last method
				}
				if (compensationMethods[0] === "Card" && method === "Cash") {
					setEarning((prev) => {
						const next = clearHiddenPaymentAmounts<EarningFormState>({
							...prev,
							compensationMethods: ["Cash"],
							tipMethods: ["Cash"],
							isCashDiscount: true,
							isCashSupply: true,
						});
						validate(next);
						return next;
					});
					return;
				}
			}
			const newMethods = compensationMethods.includes(method)
				? compensationMethods.filter((m) => m !== method)
				: [...compensationMethods, method];
			setEarning((prev) => {
				const newEarning = clearHiddenPaymentAmounts<EarningFormState>({
					...prev,
					compensationMethods: newMethods,
					tipMethods:
						method === "Cash" && !newMethods.includes("Cash")
							? Array.from(
									new Set(
										prev.tipMethods
											.filter((m) => m !== "Cash")
											.concat(["Card"]),
									),
								)
							: prev.tipMethods,
					isCashDiscount: undefined,
					isCashSupply: undefined,
				});
				validate(newEarning);
				return newEarning;
			});
		},
		[compensationMethods, validate, setEarning],
	);

	const handleSelectTipMethod = useCallback(
		(method: PaymentMethod) => {
			if (
				tipMethods.length === 1 &&
				tipMethods[0] === "Card" &&
				method === "Cash"
			) {
				setEarning((prev) => {
					const next = clearHiddenPaymentAmounts<EarningFormState>({
						...prev,
						tipMethods: ["Cash"],
					});
					validate(next);
					return next;
				});
				return;
			}
			const newMethods = tipMethods.includes(method)
				? tipMethods.filter((m) => m !== method)
				: [...tipMethods, method];

			setEarning((prev) => {
				const newEarning = clearHiddenPaymentAmounts<EarningFormState>({
					...prev,
					tipMethods: newMethods,
				});
				validate(newEarning);
				return newEarning;
			});
		},
		[tipMethods, validate, setEarning],
	);

	const handleValidateAndSubmit = useCallback(() => {
		if (!draftLocked && validate(earning)) {
			onSubmit();
		}
	}, [draftLocked, validate, earning, onSubmit]);

	const handleDateChange = useCallback(
		(_: unknown, selectedDate: Date | undefined) => {
			updateEarning("serviceDate", selectedDate?.getTime() ?? serviceDate);
		},
		[updateEarning, serviceDate],
	);

	/* --------------------------------- Render --------------------------------- */
	return (
		<>
			{!!saveError && (
				<Text
					accessibilityRole="alert"
					style={{
						color: colors.error,
						padding: 16,
						paddingTop: headerHeight + 16,
					}}
				>
					{saveError}
				</Text>
			)}
			<ScreenScrollView
				contentContainerClassName="gap-4"
				keyboardShouldPersistTaps="handled"
				onScrollBeginDrag={Keyboard.dismiss}
			>
				<FormHeader title={title} description={description} />

				<View
					className="gap-4"
					pointerEvents={draftLocked ? "none" : "auto"}
					accessibilityState={{ disabled: draftLocked }}
				>
					{/* Compensation */}
					<CompensationSection
						cash={cash}
						card={card}
						gift={gift}
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
						tipCash={tipCash}
						tipCard={tipCard}
						tipGift={tipGift}
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
						mutedColor={mutedColor}
						getFieldError={getFieldError}
						selectedInputs={selectedInputs}
						setSelectedInputs={setSelectedInputs}
						earning={earning}
						setEarning={setEarning}
						updateEarning={updateEarning}
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
				</View>
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
		</>
	);
}
