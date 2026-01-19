import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, View } from "react-native";
import FormHeader from "@/components/form";
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

const paymentMethods = ["Card", "Cash", "Gift Card"] as PaymentMethod[];

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

	const [earning, setEarning] = useState<EarningFormState>({
		compensation: "",
		compensationMethods: ["Card"] as PaymentMethod[],
		tip: "",
		tipMethods: ["Card"] as PaymentMethod[],
		discount: "",
		gift: "",
		giftCode: "",
		technicianId: "" as User["_id"],
		services: [] as Category["_id"][],
		clientId: "" as User["_id"],
		serviceDate: Date.now(),
	});

	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Populate form when transaction loads
	useEffect(() => {
		if (transaction) {
			setEarning({
				compensation: transaction.compensation.toString(),
				compensationMethods: transaction.compensationMethods as PaymentMethod[],
				tip: transaction.tip.toString(),
				tipMethods: transaction.tipMethods as PaymentMethod[],
				discount: transaction.discount?.toString() || "",
				gift: transaction.gift?.toString() || "",
				giftCode: "", // We'll need to handle this differently since it's stored as ID
				technicianId: transaction.technician,
				services: transaction.services || [],
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

		if (!transaction || !transactionId) return;

		try {
			setIsLoading(true);
			await updateTransaction({
				id: transactionId as Id<"transactions">,
				body: earning,
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
			setIsLoading(false);
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
					placeholder="Enter Compensation"
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
			{/* tip text-field*/}
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

			{/* gift text-field*/}
			{earning.compensationMethods.includes("Gift Card") ||
			earning.tipMethods.includes("Gift Card") ? (
				<>
					<TextField isRequired>
						<TextField.Input
							className="h-16 rounded-3xl"
							placeholder="Enter Gift Card Code"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.giftCode?.toString()}
							onChangeText={(value) =>
								setEarning({ ...earning, giftCode: value })
							}
						>
							<TextField.InputStartContent className="pointer-events-none pl-2">
								<Ionicons name="code-outline" size={20} color={mutedColor} />
							</TextField.InputStartContent>
						</TextField.Input>
					</TextField>
					<TextField isRequired>
						<TextField.Input
							className="h-16 rounded-3xl"
							placeholder="Enter amount from Gift Card"
							keyboardType="numeric"
							autoCapitalize="none"
							value={earning.gift?.toString()}
							onChangeText={(value) => setEarning({ ...earning, gift: value })}
						>
							<TextField.InputStartContent className="pointer-events-none pl-2">
								<Ionicons name="cash-outline" size={20} color={mutedColor} />
							</TextField.InputStartContent>
						</TextField.Input>
					</TextField>
				</>
			) : null}
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
				isDisabled={isLoading}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>
					{isLoading ? "Updating Transaction..." : "Update"}
				</Button.Label>
				{isLoading ? <Spinner color={background} /> : null}
			</Button>
		</ScreenScrollView>
	);
}
