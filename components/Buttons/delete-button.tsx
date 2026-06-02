import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { Button } from "react-native-paper";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Type = "transactions" | "giftCards";
type Props = {
	type: Type;
	id: Id<Type> | undefined;
	isDisabled?: boolean;
};

export const DeleteButton = ({ type, id, isDisabled }: Props) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const deleteApi =
		type === "transactions"
			? api.transactions.deleteTransaction
			: api.giftCards.deleteGiftCard;
	const onDelete = useMutation(deleteApi);

	const handleDelete = useCallback(async () => {
		Alert.alert(
			`Delete ${type}`,
			`Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);
							if (id) {
								if (type === "transactions") {
									await onDelete({ id: id as Id<"transactions"> });
									Alert.alert("Success", "Transaction deleted successfully.", [
										{ text: "OK", onPress: () => router.back() },
									]);
								} else {
									await onDelete({ id: id as Id<"giftCards"> });
									Alert.alert("Success", "Gift card deleted successfully.");
								}
							} else {
								Alert.alert("Error", "ID is missing. Cannot delete.");
							}
						} catch (error) {
							Alert.alert(
								"Error",
								`Failed to delete ${type.toLowerCase()}. Please try again.`,
							);
							console.error(`Failed to delete ${type.toLowerCase()}:`, error);
						} finally {
							setIsDeleting(false);
						}
					},
				},
			],
		);
	}, [onDelete, type, id]);

	return (
		<Button
			onPress={handleDelete}
			disabled={isDeleting || isDisabled}
			mode="contained"
			className="rounded-3xl"
			buttonColor="#ef4444"
			loading={isDeleting}
		>
			{isDeleting ? "Deleting..." : `Delete ${type}`}
		</Button>
	);
};
