import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";

import FormHeader, {
	GiftCardInputs,
	otherInputs,
	paymentMethods,
} from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Category, EarningFormState, PaymentMethod } from "@/utils/types";

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
	const background = useThemeColor("background");
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

	const compensationTypes =
		card && cash
			? "Card and Cash"
			: card && !cash
				? "Card"
				: cash && !card && "Cash";
	const placeholder = compensationTypes
		? `Enter Total ${compensationTypes} Charge`
		: "";

	const isDisabled =
		isLoading ||
		!!giftError ||
		(!!earning.giftCode && !giftCard) ||
		isDeleting ||
		!compensationTypes;

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
						variant={
							earning.compensationMethods.includes(method)
								? "primary"
								: "secondary"
						}
						onPress={() => handleSelectMethods(method, "compensation")}
					>
						<Chip.Label>{method}</Chip.Label>
					</Chip>
				))}
			</View>

			{/* compensation text-field*/}
			<TextField isRequired className="focus">
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder={placeholder}
					keyboardType="numeric"
					autoCapitalize="none"
					autoFocus={true}
					value={earning.compensation.toString()}
					onChangeText={(value) =>
						setEarning({ ...earning, compensation: value })
					}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
			{!compensationTypes && (
				<Text className="px-4 text-red-500 text-sm">
					Please select at least one compensation method
				</Text>
			)}

			{/* compensation In Cash text-field */}
			{cash && card ? (
				<TextField isRequired className="focus">
					<TextField.Input
						className="h-16 rounded-3xl"
						placeholder="Enter Cash Amount"
						keyboardType="numeric"
						autoCapitalize="none"
						value={earning.compInCash?.toString()}
						onChangeText={(value) =>
							setEarning({ ...earning, compInCash: value })
						}
					>
						<TextField.InputStartContent className="pointer-events-none pl-2">
							<Ionicons name="cash-outline" size={20} color={mutedColor} />
						</TextField.InputStartContent>
					</TextField.Input>
				</TextField>
			) : null}

			{/* gift text-field*/}
			<GiftCardInputs
				earning={earning}
				setEarning={setEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				type={gift === true ? "compInGift" : undefined}
			/>

			{/* Other Inputs */}
			<View className="flex-row flex-wrap gap-2">
				{otherInputs.map((input) => (
					<Chip
						key={input}
						variant={selectedInputs.includes(input) ? "primary" : "secondary"}
						onPress={() =>
							setSelectedInputs((prev) => {
								if (prev.includes(input)) {
									return prev.filter((i) => i !== input);
								}
								return [...prev, input];
							})
						}
					>
						<Chip.Label>{input}</Chip.Label>
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
								variant={
									earning.tipMethods.includes(method) ? "primary" : "secondary"
								}
								onPress={() => handleSelectMethods(method, "tip")}
							>
								<Chip.Label>{method}</Chip.Label>
							</Chip>
						))}
					</View>
					{/* tip text-field */}
					<TextField isRequired className="focus">
						<TextField.Input
							className="h-16 rounded-3xl"
							placeholder="Enter Total Tip"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.tip.toString()}
							onChangeText={(value) => setEarning({ ...earning, tip: value })}
						>
							<TextField.InputStartContent className="pointer-events-none pl-2">
								<Ionicons name="cash-outline" size={20} color={mutedColor} />
							</TextField.InputStartContent>
						</TextField.Input>
					</TextField>
					{/* tip In Cash text-field */}
					{tipCash && tipCard && (
						<TextField isRequired className="focus">
							<TextField.Input
								className="h-16 rounded-3xl"
								placeholder="Enter Tip in Cash Amount"
								keyboardType="numeric"
								autoCapitalize="none"
								value={earning.tipInCash?.toString()}
								onChangeText={(value) =>
									setEarning({ ...earning, tipInCash: value })
								}
							>
								<TextField.InputStartContent className="pointer-events-none pl-2">
									<Ionicons name="cash-outline" size={20} color={mutedColor} />
								</TextField.InputStartContent>
							</TextField.Input>
						</TextField>
					)}
				</View>
			) : null}

			{/* discount text-field */}
			{discount ? (
				<TextField isRequired className="focus">
					<TextField.Input
						className="h-16 rounded-3xl"
						placeholder="Enter discount"
						keyboardType="numeric"
						autoCapitalize="none"
						value={earning.discount?.toString()}
						onChangeText={(value) =>
							setEarning({ ...earning, discount: value })
						}
					>
						<TextField.InputStartContent className="pointer-events-none pl-2">
							<Ionicons name="cash-outline" size={20} color={mutedColor} />
						</TextField.InputStartContent>
					</TextField.Input>
				</TextField>
			) : null}

			{supply ? (
				<TextField isRequired className="focus">
					<TextField.Input
						className="h-16 rounded-3xl"
						placeholder="Enter supply cost"
						keyboardType="numeric"
						autoCapitalize="none"
						value={earning.supply?.toString()}
						onChangeText={(value) => setEarning({ ...earning, supply: value })}
					>
						<TextField.InputStartContent className="pointer-events-none pl-2">
							<Ionicons name="cash-outline" size={20} color={mutedColor} />
						</TextField.InputStartContent>
					</TextField.Input>
				</TextField>
			) : null}

			{/* tip gift text-field*/}
			<GiftCardInputs
				earning={earning}
				setEarning={setEarning}
				giftCard={giftCard}
				giftError={giftError}
				setGiftError={setGiftError}
				type={tipGift === true ? "tipInGift" : undefined}
			/>

			{/* service categories */}
			<View className="mt-4 mb-4 flex-row flex-wrap gap-2">
				{categories?.map((category) => (
					<Chip
						key={category._id}
						variant={
							earning.services.includes(category._id) ? "primary" : "secondary"
						}
						onPress={() => handleSelectServices(category._id)}
					>
						<Chip.Label>{category.name}</Chip.Label>
					</Chip>
				))}
			</View>

			{/* service time field */}
			<TextField>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Select service time"
					value={new Date(earning.serviceDate).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
					editable={false}
					onPressIn={() => setOpen(!open)}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="time-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
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
			</TextField>

			<Button
				onPress={onSubmit}
				isDisabled={isDisabled}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>{submitLabel}</Button.Label>
				{isLoading ? <Spinner color={background} /> : null}
			</Button>

			{type === "edit" && (
				<Button
					onPress={handleDelete}
					isDisabled={isDisabled}
					size="lg"
					className="rounded-3xl"
					variant="destructive"
				>
					<Button.Label>
						{isDeleting ? "Deleting..." : "Delete Transaction"}
					</Button.Label>
					{isDeleting ? <Spinner color={background} /> : null}
				</Button>
			)}
		</ScreenScrollView>
	);
}
