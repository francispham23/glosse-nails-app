import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Chip, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";

import FormHeader, {
	initialEarningState,
	paymentMethods,
} from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import type {
	Category,
	EarningFormState,
	PaymentMethod,
	User,
} from "@/utils/types";

export default function CreateRoute() {
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const router = useRouter();
	const params = useLocalSearchParams();
	const technicianId = params.technicianId as User["_id"];
	const technician = useQuery(api.users.getUserById, {
		userId: technicianId,
	});
	const { date, endOfDay } = useAppDate();

	/* ---------------------------------- state --------------------------------- */
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [giftError, setGiftError] = useState("");
	const [earning, setEarning] = useState<EarningFormState>({
		...initialEarningState,
		technicianId,
		// TODO: allow selecting client ID later
		clientId: technicianId, // Default client ID
		serviceDate: date.getTime(),
	});

	const categories = useQuery(api.categories.getFormCategories);
	const addTransaction = useMutation(api.transactions.addTransaction);
	const giftCard = useQuery(
		api.giftCards.getByCode,
		earning.giftCode ? { code: earning.giftCode } : "skip",
	);

	/* ----------------------------- handle create transaction ----------------------------- */
	const handleSubmit = async () => {
		if (!earning.compensation) {
			Alert.alert("Error", "Please enter your earning");
			return;
		}

		if (giftError) {
			Alert.alert("Error", giftError);
			return;
		}

		try {
			setIsLoading(true);
			// Store earning in Convex
			const tip = earning.tip.length > 0 ? earning.tip : "0";
			await addTransaction({ body: { ...earning, tip } });
			// Store earning in AsyncStorage for later bulk insertion at checkout

			setEarning({
				...initialEarningState,
				technicianId,
				// TODO: allow selecting client ID later
				clientId: technicianId, // Default client ID
				serviceDate: Date.now(),
			});
			Alert.alert("Success", "Earning saved successfully");
			router.push(`/technician/${technicianId}`);
		} catch (error) {
			console.error("Error storing earning:", error);
			Alert.alert("Error", "Failed to save earning. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

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

	const cash = earning.compensationMethods.includes("Cash");
	const card = earning.compensationMethods.includes("Card");
	const gift = earning.compensationMethods.includes("Gift Card");
	const discount = earning.compensationMethods.includes("Discount");
	const tipCash = earning.tipMethods.includes("Cash");
	const tipCard = earning.tipMethods.includes("Card");
	const tipGift = earning.tipMethods.includes("Gift Card");

	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			{/* header */}
			<FormHeader
				title={`${technician?.name?.split(" ")[0]}'s Earning`}
				description="Add a new earning for this technician"
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
			{cash && card ? (
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
									: date.getTime(),
							});
						}}
					/>
				)}
			</TextField>
			<Button
				onPress={handleSubmit}
				isDisabled={
					isLoading || !!giftError || (!!earning.giftCode && !giftCard)
				}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>
					{isLoading ? "Submitting Earning..." : "Submit"}
				</Button.Label>
				{isLoading ? <Spinner color={background} /> : null}
			</Button>
		</ScreenScrollView>
	);
}
