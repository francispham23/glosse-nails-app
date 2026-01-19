import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";

import FormHeader from "@/components/form";
import { ScreenScrollView } from "@/components/screen-scroll-view";

import { api } from "@/convex/_generated/api";

export default function CreateRoute() {
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");

	const router = useRouter();

	const [code, setCode] = useState("");
	const [balance, setBalance] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const createGiftCard = useMutation(api.giftCards.create);

	/* ----------------------------- handle sign in ----------------------------- */
	const handleSubmit = async () => {
		if (!code.trim()) {
			Alert.alert("Error", "Please enter gift card code");
			return;
		}

		if (!balance || Number.parseFloat(balance) <= 0) {
			Alert.alert("Error", "Please enter a valid balance");
			return;
		}

		try {
			setIsLoading(true);
			await createGiftCard({
				code: code.trim(),
				balance: Number.parseFloat(balance),
			});

			Alert.alert("Success", "Gift card created successfully");
			setCode("");
			setBalance("");
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
			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter Gift Card Code"
					autoCapitalize="characters"
					autoFocus={true}
					value={code}
					onChangeText={setCode}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="card-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>

			<TextField isRequired>
				<TextField.Input
					className="h-16 rounded-3xl"
					placeholder="Enter Initial Balance"
					keyboardType="numeric"
					value={balance}
					onChangeText={setBalance}
				>
					<TextField.InputStartContent className="pointer-events-none pl-2">
						<Ionicons name="cash-outline" size={20} color={mutedColor} />
					</TextField.InputStartContent>
				</TextField.Input>
			</TextField>

			<Button
				onPress={handleSubmit}
				isDisabled={isLoading}
				size="lg"
				className="rounded-3xl"
			>
				<Button.Label>
					{isLoading ? "Creating..." : "Create Gift Card"}
				</Button.Label>
				{isLoading ? <Spinner color={background} /> : null}
			</Button>
		</ScreenScrollView>
	);
}
