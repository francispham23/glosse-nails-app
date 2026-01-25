import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";

import FormHeader, {
	initialEarningState,
	paymentMethods,
} from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
	Category,
	EarningFormState,
	PaymentMethod,
	User,
} from "@/utils/types";

export default function EditTransactionScreen() {
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");
	const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
	const { endOfDay } = useAppDate();

	// Fetch the transaction
	const transaction = useQuery(
		api.transactions.getById,
		transactionId ? { id: transactionId as Id<"transactions"> } : "skip",
	);

	const categories = useQuery(api.categories.getFormCategories);
	const updateTransaction = useMutation(api.transactions.updateTransaction);
	const deleteTransaction = useMutation(api.transactions.deleteTransaction);

	const [earning, setEarning] = useState<EarningFormState>({
		...initialEarningState,
		technicianId: "" as User["_id"],
		clientId: "" as User["_id"],
		serviceDate: Date.now(),
	});

	const giftCard = useQuery(
		api.giftCards.getByCode,
		earning.giftCode ? { code: earning.giftCode } : "skip",
	);

	const [open, setOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [giftError, setGiftError] = useState("");

	// Populate form when transaction loads
	useEffect(() => {
		if (transaction) {
			setEarning({
				compensation: transaction.compensation.toString(),
				compInCash: transaction.compInCash?.toString() || "",
				compensationMethods: transaction.compensationMethods as PaymentMethod[],
				tip: transaction.tip.toString(),
				tipInCash: transaction.tipInCash?.toString() || "",
				tipMethods: transaction.tipMethods as PaymentMethod[],
				discount: transaction.discount?.toString() || "",
				gift: transaction.gift?.toString() || "",
				giftCode: "", // We'll need to handle this differently since it's stored as ID
				services: transaction.services || [],
				technicianId: transaction.technician,
				clientId: transaction.client,
				serviceDate: transaction.serviceDate || Date.now(),
			});
		}
	}, [transaction]);

	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter compensation");
			return;
		}

		if (giftError) {
			Alert.alert("Error", giftError);
			return;
		}

		if (!transaction || !transactionId) return;

		try {
			setIsUpdating(true);
			const tip = earning.tip.length > 0 ? earning.tip : "0";
			await updateTransaction({
				id: transactionId as Id<"transactions">,
				body: { ...earning, tip },
			});

			Alert.alert("Success", "Transaction updated successfully", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert("Error", "Failed to update transaction");
			console.error("Failed to update transaction:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleSelectServices = (categoryId: Category["_id"]) =>
		setEarning((prev) => {
			const services = prev.services.includes(categoryId)
				? prev.services.filter((id) => id !== categoryId)
				: [...prev.services, categoryId];
			return { ...prev, services };
		});

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
	const tipCash = earning.tipMethods.includes("Cash");
	const tipCard = earning.tipMethods.includes("Card");
	const tipGift = earning.tipMethods.includes("Gift Card");

	if (!transaction) {
		return (
			<View className="flex-1 items-center justify-center">
				<Spinner size="lg" />
			</View>
		);
	}

	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			{/* header */}
			<FormHeader
				title="Edit Transaction"
				description="Update transaction details"
			/>
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
			{/* compensation In Cash text-field */}
			{cash && card && (
				<TextField isRequired className="focus">
					<TextField.Input
						className="h-16 rounded-3xl"
						placeholder="Enter Cash Amount"
						keyboardType="numeric"
						autoCapitalize="none"
						autoFocus={true}
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
			)}
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
			{/* tip text-field */}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter Tip"
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
			<View className="flex-row flex-wrap gap-2">
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
						<Text className="px-4 text-muted-foreground text-sm">
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
			{/* discount text-field*/}
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter discount"
					keyboardType="numeric"
					autoCapitalize="none"
					value={earning.discount?.toString()}
					onChangeText={(value) => setEarning({ ...earning, discount: value })}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>
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
						<Chip.Label>
							{category.name.split(" ")[0].split("ing")[0]}
						</Chip.Label>
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
				onPress={handleSubmit}
				isDisabled={
					isUpdating ||
					isDeleting ||
					!!giftError ||
					(!!earning.giftCode && !giftCard)
				}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>{isUpdating ? "Updating..." : "Update"}</Button.Label>
				{isUpdating ? <Spinner color={background} /> : null}
			</Button>
			<Button
				onPress={handleDelete}
				isDisabled={
					isUpdating ||
					isDeleting ||
					!!giftError ||
					(!!earning.giftCode && !giftCard)
				}
				size="lg"
				className="rounded-3xl"
				variant="destructive"
			>
				<Button.Label>
					{isDeleting ? "Deleting..." : "Delete Transaction"}
				</Button.Label>
				{isDeleting ? <Spinner color={background} /> : null}
			</Button>
		</ScreenScrollView>
	);
}
