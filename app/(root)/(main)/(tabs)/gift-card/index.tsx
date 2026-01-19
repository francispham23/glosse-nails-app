import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { Button, Spinner, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { AddButton } from "@/components/Buttons/add-button";
import { GiftCard } from "@/components/gift-card";
import { ListEmptyComponent } from "@/components/list-empty";
import { useAppTheme } from "@/contexts/app-theme-context";
import { api } from "@/convex/_generated/api";
import type { Gift as GiftType } from "@/utils/types";

export default function GiftCardRoute() {
	const { isLight } = useAppTheme();
	const background = useThemeColor("background");
	const mutedColor = useThemeColor("muted");
	const giftCards = useQuery(api.giftCards.list);
	const createGiftCard = useMutation(api.giftCards.create);

	const [isOpening, setIsOpening] = useState(false);
	const [code, setCode] = useState("");
	const [balance, setBalance] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
			setIsOpening(false);
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : "Failed to create gift card",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setCode("");
		setBalance("");
		setIsOpening(false);
	};

	return (
		<Animated.View className="flex-1 p-2" entering={FadeIn} exiting={FadeOut}>
			<Animated.FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-4 px-3 pb-24"
				entering={FadeIn}
				exiting={FadeOut}
				data={giftCards}
				renderItem={({ item }: { item: GiftType }) => (
					<GiftCard giftCard={item} />
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={<ListEmptyComponent item="gift card" />}
			/>
			<View className="absolute bottom-30 self-center">
				<AddButton isAdding={isOpening} setIsAdding={setIsOpening} />
			</View>

			<Modal
				animationType="slide"
				transparent={true}
				visible={isOpening}
				onRequestClose={handleClose}
			>
				<View className="flex-1 justify-end">
					<Pressable className="flex-1" onPress={handleClose} />
					<View className="max-h-[70%] rounded-t-3xl bg-background p-6 shadow-lg">
						<View className="mb-6 flex-row items-center justify-between">
							<View className="flex-1">
								<Text className="font-bold text-2xl text-foreground">
									Create Gift Card
								</Text>
								<Text className="text-muted-foreground">
									Add a new gift card to the system
								</Text>
							</View>
							<Pressable
								onPress={handleClose}
								className="rounded-full bg-background-secondary p-2"
							>
								<Ionicons
									name="close"
									size={24}
									color={isLight ? "#000" : "#fff"}
								/>
							</Pressable>
						</View>

						<View className="gap-4">
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
										<Ionicons
											name="card-outline"
											size={20}
											color={mutedColor}
										/>
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
										<Ionicons
											name="cash-outline"
											size={20}
											color={mutedColor}
										/>
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
						</View>
					</View>
				</View>
			</Modal>
		</Animated.View>
	);
}
