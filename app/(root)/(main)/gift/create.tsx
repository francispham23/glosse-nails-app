import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";
import { Button } from "react-native-paper";
import FormHeader from "@/components/Form/form";
import { NumericInput } from "@/components/Form/numeric-input";
import { SellDatePicker } from "@/components/Form/sell-date-picker";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { useAppDate } from "@/contexts/app-date-context";
import { useWebRouteDismiss } from "@/contexts/web-route-dismiss-context";
import { api } from "@/convex/_generated/api";
import { getErrorMessage, useThemeColor } from "@/utils";
import { parseAmount } from "@/utils/financial-validation";

export default function CreateRoute() {
	const mutedColor = useThemeColor("muted");
	const { endOfDay } = useAppDate();
	const router = useRouter();
	const createGiftCard = useMutation(api.giftCards.create);

	const [code, setCode] = useState("");
	const [value, setValue] = useState("");
	const [date, setDate] = useState(new Date());
	const [isLoading, setIsLoading] = useState(false);
	const mounted = useRef(true);
	const { setDismissDisabled } = useWebRouteDismiss();
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			setDismissDisabled(false);
		};
	}, [setDismissDisabled]);

	/* ----------------------------- handle submit ----------------------------- */
	const handleSubmit = async () => {
		if (!code.trim()) {
			Alert.alert("Error", "Please enter gift card code");
			return;
		}

		let amount: number;
		try {
			amount = parseAmount(value, "Gift value", true) as number;
			if (amount <= 0)
				throw new Error("Gift value must be positive after rounding");
		} catch (error) {
			Alert.alert(
				"Error",
				getErrorMessage(error, "Please enter a valid value"),
			);
			return;
		}

		try {
			setDismissDisabled(true);
			setIsLoading(true);
			await createGiftCard({
				code: code.trim(),
				value: amount,
				sellDate: date.getTime(),
			});
			if (!mounted.current) return;

			Alert.alert("Success", "Gift card created successfully");
			setCode("");
			setValue("");
			setDate(new Date());
			router.back();
		} catch (error) {
			if (!mounted.current) return;
			Alert.alert(
				"Error",
				getErrorMessage(error, "Failed to create gift card"),
			);
		} finally {
			if (mounted.current) {
				setIsLoading(false);
				setDismissDisabled(false);
			}
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

			<SellDatePicker
				date={date}
				maximumDate={endOfDay}
				mutedColor={mutedColor}
				onChange={setDate}
			/>

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
