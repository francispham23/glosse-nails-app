import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { Button, TextInput } from "react-native-paper";

import FormHeader from "@/components/Form/form";
import { NumericInput } from "@/components/Form/numeric-input";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { useThemeColor } from "@/utils";

export default function CreateRoute() {
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();
	const router = useRouter();
	const createGiftCard = useMutation(api.giftCards.create);

	const [code, setCode] = useState("");
	const [value, setValue] = useState("");
	const [date, setDate] = useState(new Date());
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSubmit = async () => {
		if (!code.trim()) {
			Alert.alert("Error", "Please enter gift card code");
			return;
		}

		if (!value || Number.parseFloat(value) <= 0) {
			Alert.alert("Error", "Please enter a valid value");
			return;
		}

		try {
			setIsLoading(true);
			await createGiftCard({
				code: code.trim(),
				value: Number.parseFloat(value),
				sellDate: date.getTime(),
			});

			Alert.alert("Success", "Gift card created successfully");
			setCode("");
			setValue("");
			setDate(new Date());
			router.back();
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : "Failed to create gift card",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ScreenScrollView
			contentContainerClassName="gap-4"
			keyboardShouldPersistTaps="handled"
			onScrollBeginDrag={Keyboard.dismiss}
		>
			{/* header */}
			<FormHeader
				title="Create Gift Card"
				description="Add a new gift card to the system"
			/>
			{/* gift card code field */}
			<NumericInput
				placeholder="Enter Gift Card Code"
				value={code}
				onChangeText={setCode}
				icon="barcode"
				iconColor={mutedColor}
			/>

			{/* gift card value field */}
			<NumericInput
				placeholder="Enter Gift Card Value"
				value={value}
				onChangeText={setValue}
				icon="wallet-giftcard"
				iconColor={mutedColor}
			/>

			{/* Sell Time Picker */}
			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder="Select service date"
				value={date.toLocaleDateString([])}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={<TextInput.Icon icon="calendar-outline" color={mutedColor} />}
			/>
			{open && (
				<DateTimePicker
					mode="date"
					value={date}
					maximumDate={endOfDay}
					display="spinner"
					onChange={(_, selectedDate) => {
						setDate(selectedDate || date);
						setOpen(false);
					}}
				/>
			)}

			{/* Submit Button */}
			<Button
				onPress={handleSubmit}
				disabled={isLoading}
				mode="contained"
				loading={isLoading}
				className="rounded-3xl"
			>
				{isLoading ? "Creating..." : "Create Gift Card"}
			</Button>
		</ScreenScrollView>
	);
}
