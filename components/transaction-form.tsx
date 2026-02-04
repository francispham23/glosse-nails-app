import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";
import { Button, Chip, TextInput } from "react-native-paper";

import FormHeader, {
	GiftCardInputs,
	otherInputs,
	paymentMethods,
} from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useThemeColor } from "@/utils";
import type { Category, EarningFormState, PaymentMethod } from "@/utils/types";
import { EarningFormSchema } from "@/utils/validation";

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
}

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
}: TransactionFormProps) {
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();

	const deleteTransaction = useMutation(api.transactions.deleteTransaction);
	const categories = useQuery(api.categories.getFormCategories);
	const giftCard = useQuery(
		api.giftCards.getByCode,
		earning.giftCode ? { code: earning.giftCode } : "skip",
	);

	/* ---------------------------------- state --------------------------------- */
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedInputs, setSelectedInputs] = useState<string[]>(["Tip"]);
	const { errors, validate, getFieldError } =
		useFormValidation(EarningFormSchema);

	/* ------------------- clear validation errors when gift error changes ------------------- */
	useEffect(() => {
		if (giftError) {
			//TODO: Gift validation is handled separately
		}
	}, [giftError]);

	/* ------------------- handle select services ------------------- */
	const handleSelectServices = (categoryId: Category["_id"]) =>
		setEarning((prev) => {
			const services = prev.services.includes(categoryId)
				? prev.services.filter((id) => id !== categoryId)
				: [...prev.services, categoryId];
			return { ...prev, services };
		});

	/* ------------------- handle select methods ------------------- */
	const handleSelectMethods = (
		method: PaymentMethod,
		type: "compensation" | "tip",
	) =>
		setEarning((prev) => {
			const methods =
				type === "compensation"
					? prev.compensationMethods.includes(method)
						? prev.compensationMethods.filter((m) => m !== method)
						: [...prev.compensationMethods, method]
					: prev.tipMethods.includes(method)
						? prev.tipMethods.filter((m) => m !== method)
						: [...prev.tipMethods, method];
			return type === "compensation"
				? { ...prev, compensationMethods: methods }
				: { ...prev, tipMethods: methods };
		});

	/* ------------------- handle delete transaction ------------------- */
	const handleDelete = async () => {
		if (!transactionId) return;

		Alert.alert(
			"Delete Transaction",
			"Are you sure you want to delete this transaction? This action cannot be undone.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);

							// Delete from Convex database
							await deleteTransaction({
								id: transactionId as Id<"transactions">,
							});

							Alert.alert("Success", "Transaction deleted successfully", [
								{
									text: "OK",
									onPress: () => router.back(),
								},
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
	};

	/* ------------------- handle validate and submit ------------------- */
	const handleValidateAndSubmit = () => {
		if (validate(earning)) {
			onSubmit();
		}
	};

	/* ------------------- transaction types ------------------- */
	const cash = earning.compensationMethods.includes("Cash");
	const card = earning.compensationMethods.includes("Card");
	const gift = earning.compensationMethods.includes("Gift Card");
	const tipCash = earning.tipMethods.includes("Cash");
	const tipCard = earning.tipMethods.includes("Card");
	const tipGift = earning.tipMethods.includes("Gift Card");

	/* ------------------- other input types ------------------- */
	const tip = selectedInputs.includes("Tip");
	const supply = selectedInputs.includes("Supply");
	const discount = selectedInputs.includes("Discount");

	const getPlaceholder = (
		car: boolean | null,
		cas: boolean | null,
		gif: boolean | null,
	) => {
		let paymentTypes = "";
		if (car && cas && gif) {
			paymentTypes = "Card, Cash, and Gift Card";
		} else if (car && cas) {
			paymentTypes = "Card and Cash";
		} else if (car && gif) {
			paymentTypes = "Card and Gift Card";
		} else if (cas && gif) {
			paymentTypes = "Cash and Gift Card";
		} else if (car) {
			paymentTypes = "Card";
		} else if (cas) {
			paymentTypes = "Cash";
		} else if (gif) {
			paymentTypes = "Gift Card";
		}
		return paymentTypes ? `Enter Total ${paymentTypes} Charge` : "";
	};

	/* ------------------- disable submit if loading or errors ------------------- */
	const isDisabled =
		isLoading ||
		Object.keys(errors).length > 0 ||
		!!giftError ||
		(!!earning.giftCode && !giftCard) ||
		isDeleting ||
		!getPlaceholder(card, cash, gift);

	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			<FormHeader title={title} description={description} />

			{/* Compensation Methods */}
			<View className="flex-row flex-wrap gap-2 pt-4">
				{paymentMethods.map((method) => (
					<Chip
						key={method}
						selected={earning.compensationMethods.includes(method)}
						className={
							earning.compensationMethods.includes(method)
								? "opacity-60"
								: "opacity-100"
						}
						onPress={() => handleSelectMethods(method, "compensation")}
					>
						{method}
					</Chip>
				))}
			</View>

			{/* compensation text-field*/}

			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder={
					getPlaceholder(card, cash, gift) || "Select Compensation Methods"
				}
				keyboardType="numeric"
				autoCapitalize="none"
				autoFocus={true}
				value={earning.compensation.toString()}
				onChangeText={(value) =>
					setEarning({ ...earning, compensation: value })
				}
				left={
					<TextInput.Icon
						icon="credit-card-outline"
						size={22}
						color={mutedColor}
					/>
				}
			/>

			{getFieldError("compensation") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("compensation")}
				</Text>
			)}
			{!getPlaceholder(card, cash, gift) && (
				<Text className="px-4 text-red-500 text-sm">
					Please select at least one compensation method
				</Text>
			)}

			{/* compensation In Cash text-field */}
			{cash && card ? (
				<TextInput
					mode="outlined"
					className="h-16 rounded-3xl"
					placeholder="Enter Cash Amount"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.compInCash?.toString()}
					onChangeText={(value) =>
						setEarning({ ...earning, compInCash: value })
					}
					left={
						<TextInput.Icon icon="cash-multiple" size={22} color={mutedColor} />
					}
				/>
			) : null}
			{getFieldError("compInCash") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("compInCash")}
				</Text>
			)}

			{/* gift text-field*/}
			<GiftCardInputs
				earning={earning}
				setEarning={setEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				type={gift === true ? "compInGift" : undefined}
			/>
			{getFieldError("compInGift") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("compInGift")}
				</Text>
			)}

			{/* Other Inputs */}
			<View className="flex-row flex-wrap gap-2">
				{otherInputs.map((input) => (
					<Chip
						key={input}
						selected={selectedInputs.includes(input)}
						className={
							selectedInputs.includes(input) ? "opacity-60" : "opacity-100"
						}
						onPress={() =>
							setSelectedInputs((prev) => {
								if (prev.includes(input)) {
									return prev.filter((i) => i !== input);
								}
								return [...prev, input];
							})
						}
					>
						{input}
					</Chip>
				))}
			</View>

			{tip ? (
				<View className="flex gap-2">
					{/* Tip Methods */}
					<View className="flex-row flex-wrap justify-end gap-2">
						{paymentMethods.map((method) => (
							<Chip
								key={method}
								selected={earning.tipMethods.includes(method)}
								className={
									earning.tipMethods.includes(method)
										? "opacity-60"
										: "opacity-100"
								}
								onPress={() => handleSelectMethods(method, "tip")}
							>
								{method}
							</Chip>
						))}
					</View>
					{/* tip text-field */}

					<TextInput
						mode="outlined"
						className="h-16 rounded-3xl"
						placeholder={
							getPlaceholder(tipCard, tipCash, tipGift) || "Select Tip Methods"
						}
						keyboardType="numeric"
						autoCapitalize="none"
						value={earning.tip === "0" ? "" : earning.tip.toString()}
						onChangeText={(value) => setEarning({ ...earning, tip: value })}
						left={
							<TextInput.Icon
								icon="credit-card-outline"
								size={22}
								color={mutedColor}
							/>
						}
					/>

					{getFieldError("tip") && (
						<Text className="px-4 text-red-500 text-sm">
							{getFieldError("tip")}
						</Text>
					)}
					{/* tip In Cash text-field */}
					{tipCash && tipCard && (
						<TextInput
							mode="outlined"
							className="h-16 rounded-3xl"
							placeholder="Enter Tip in Cash Amount"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.tipInCash?.toString()}
							onChangeText={(value) =>
								setEarning({ ...earning, tipInCash: value })
							}
							left={
								<TextInput.Icon
									icon="cash-multiple"
									size={22}
									color={mutedColor}
								/>
							}
						/>
					)}
					{getFieldError("tipInCash") && (
						<Text className="px-4 text-red-500 text-sm">
							{getFieldError("tipInCash")}
						</Text>
					)}
				</View>
			) : null}

			{/* discount text-field */}
			{discount ? (
				<TextInput
					mode="outlined"
					className="h-16 rounded-3xl"
					placeholder="Enter discount"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.discount?.toString()}
					onChangeText={(value) => setEarning({ ...earning, discount: value })}
					left={
						<TextInput.Icon icon="cash-minus" size={22} color={mutedColor} />
					}
				/>
			) : null}
			{getFieldError("discount") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("discount")}
				</Text>
			)}

			{supply ? (
				<TextInput
					mode="outlined"
					className="h-16 rounded-3xl"
					placeholder="Enter supply cost"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.supply?.toString()}
					onChangeText={(value) => setEarning({ ...earning, supply: value })}
					left={
						<TextInput.Icon
							icon="package-variant"
							size={22}
							color={mutedColor}
						/>
					}
				/>
			) : null}
			{getFieldError("supply") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("supply")}
				</Text>
			)}

			{/* tip gift text-field*/}
			<GiftCardInputs
				earning={earning}
				setEarning={setEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				type={tipGift === true ? "tipInGift" : undefined}
			/>
			{getFieldError("tipInGift") && (
				<Text className="px-4 text-red-500 text-sm">
					{getFieldError("tipInGift")}
				</Text>
			)}

			{/* service categories */}
			<View className="mt-4 mb-4 flex-row flex-wrap gap-2">
				{categories?.map((category) => (
					<Chip
						key={category._id}
						selected={earning.services.includes(category._id)}
						className={
							earning.services.includes(category._id)
								? "opacity-60"
								: "opacity-100"
						}
						onPress={() => handleSelectServices(category._id)}
					>
						{category.name}
					</Chip>
				))}
			</View>

			{/* service time field */}

			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder="Select service time"
				value={new Date(earning.serviceDate).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={
					<TextInput.Icon
						icon="clock-time-eight-outline"
						size={22}
						color={mutedColor}
					/>
				}
			/>

			{open && (
				<DateTimePicker
					mode="time"
					value={new Date(earning.serviceDate)}
					maximumDate={endOfDay}
					display="spinner"
					onChange={(_, selectedDate) => {
						setEarning({
							...earning,
							serviceDate: selectedDate
								? selectedDate.getTime()
								: earning.serviceDate,
						});
					}}
				/>
			)}

			<Button
				onPress={handleValidateAndSubmit}
				disabled={isDisabled}
				loading={isLoading}
				mode="contained"
				className="rounded-3xl"
			>
				{submitLabel}
			</Button>

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
