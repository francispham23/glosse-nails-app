import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { Button, TextInput } from "react-native-paper";

import FormHeader from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";

export default function CreateRoute() {
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
			<TextInput
				mode="outlined"
				placeholder="Enter Gift Card Code"
				autoCapitalize="characters"
				autoFocus={true}
				value={code}
				onChangeText={setCode}
				left={<TextInput.Icon icon="barcode" />}
				className="h-16 rounded-3xl"
			/>

			<TextInput
				mode="outlined"
				placeholder="Enter Gift Card Value"
				keyboardType="numeric"
				value={value}
				onChangeText={setValue}
				left={<TextInput.Icon icon="wallet-giftcard" />}
				className="h-16 rounded-3xl"
			/>

			{/* sell time field */}
			<TextInput
				mode="outlined"
				placeholder="Select service time"
				value={date.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={<TextInput.Icon icon="clock-outline" />}
				className="h-16 rounded-3xl"
			/>
			{open && (
				<DateTimePicker
					mode="time"
					value={date}
					maximumDate={endOfDay}
					display="spinner"
					onChange={(_, selectedDate) => {
						setDate(selectedDate || date);
						setOpen(false);
					}}
				/>
			)}

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
