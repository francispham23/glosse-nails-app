import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";

import FormHeader, { paymentMethods } from "@/components/form";
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
	setGiftError: (error: string) => void;
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

	const cash = earning.compensationMethods.includes("Cash");
	const card = earning.compensationMethods.includes("Card");
	const gift = earning.compensationMethods.includes("Gift Card");
	const discount = earning.compensationMethods.includes("Discount");
	const tipCash = earning.tipMethods.includes("Cash");
	const tipCard = earning.tipMethods.includes("Card");
	const tipGift = earning.tipMethods.includes("Gift Card");

	const isDisabled =
		isLoading || !!giftError || (!!earning.giftCode && !giftCard) || isDeleting;

	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			<FormHeader title={title} description={description} />

			{/* compensation text-field*/}
			<TextField isRequired className="focus">
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter Total Charge"
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

			{/* Compensation Methods */}
			<View className="flex-row flex-wrap gap-2">
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

			{/* discount text-field */}
			{discount ? (
				<TextField isRequired>
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

			{/* tip text-field */}
			<TextField isRequired>
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

			{/* Tip Methods */}
			<View className="flex-row flex-wrap gap-2">
				{paymentMethods
					.filter((method) => method !== "Discount")
					.map((method) => (
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

			{/* tip In Cash text-field */}
			{tipCash && tipCard && (
				<TextField isRequired>
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

			{/* gift text-field*/}
			{gift || tipGift ? (
				<>
					<TextField isRequired>
						<TextField.Input
							className="h-16 rounded-3xl"
							placeholder="Enter Gift Card Code"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.giftCode?.toString()}
							onChangeText={(value) => {
								setEarning({ ...earning, giftCode: value });
								setGiftError("");
							}}
						>
							<TextField.InputStartContent className="pointer-events-none pl-2">
								<Ionicons name="code-outline" size={20} color={mutedColor} />
							</TextField.InputStartContent>
						</TextField.Input>
					</TextField>
					{earning.giftCode && giftCard === null && (
						<Text className="px-4 text-red-500 text-sm">
							Gift card code not found
						</Text>
					)}
					{giftCard && (
						<Text className="px-4 text-foreground text-sm">
							Available balance: ${giftCard.balance.toFixed(2)}
						</Text>
					)}
					<TextField isRequired>
						<TextField.Input
							className="h-16 rounded-3xl"
							placeholder="Enter amount from Gift Card"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.gift?.toString()}
							onChangeText={(value) => {
								setEarning({ ...earning, gift: value });
								const giftAmount = Number.parseFloat(value || "0");
								if (giftCard && giftAmount > giftCard.balance) {
									setGiftError(
										`Gift card balance insufficient. Available: $${giftCard.balance.toFixed(2)}`,
									);
								} else {
									setGiftError("");
								}
							}}
						>
							<TextField.InputStartContent className="pointer-events-none pl-2">
								<Ionicons name="cash-outline" size={20} color={mutedColor} />
							</TextField.InputStartContent>
						</TextField.Input>
					</TextField>
					{giftError && (
						<Text className="px-4 text-red-500 text-sm">{giftError}</Text>
					)}
				</>
			) : null}

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
