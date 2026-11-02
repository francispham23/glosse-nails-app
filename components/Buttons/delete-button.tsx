import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useContext, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	DeleteDialog,
	DeleteDialogContext,
	type DeleteDialogState,
} from "./delete-dialog";

type Type = "transactions" | "giftCards";
type Props = {
	type: Type;
	id: Id<Type> | undefined;
	isDisabled?: boolean;
};

export const DeleteButton = ({ type, id, isDisabled }: Props) => {
	const { colors } = useTheme();
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDeleted, setIsDeleted] = useState(false);
	const [dialog, setLocalDialog] = useState<DeleteDialogState | null>(null);
	const sharedDialog = useContext(DeleteDialogContext);
	const setDialog = sharedDialog ?? setLocalDialog;
	const locked = useRef(false);
	const acknowledged = useRef(false);
	const onDelete = useMutation(
		type === "transactions"
			? api.transactions.deleteTransaction
			: api.giftCards.deleteGiftCard,
	);
	const item = type === "transactions" ? "transaction" : "gift card";

	const closeDialog = () => {
		if (!locked.current) setDialog(null);
	};
	const showMessage = (
		title: string,
		message: string,
		onClose = closeDialog,
	) => {
		if (Platform.OS === "web") setDialog({ title, message, onClose });
		else Alert.alert(title, message, [{ text: "OK", onPress: onClose }]);
	};
	const acknowledgeSuccess = () => {
		if (acknowledged.current) return;
		acknowledged.current = true;
		setDialog(null);
		if (type === "transactions") router.back();
	};
	const performDelete = async () => {
		if (locked.current || isDisabled) return;
		if (!id) {
			showMessage("Error", "ID is missing. Cannot delete.");
			return;
		}
		locked.current = true;
		setIsDeleting(true);
		if (Platform.OS === "web")
			setDialog({
				title: `Delete ${item}`,
				message: `Deleting ${item}...`,
				pending: true,
				onConfirm: () => {
					void performDelete();
				},
				onClose: closeDialog,
			});
		try {
			await onDelete(
				type === "transactions"
					? { id: id as Id<"transactions"> }
					: { id: id as Id<"giftCards"> },
			);
			setIsDeleted(true);
			showMessage(
				"Success",
				`${type === "transactions" ? "Transaction" : "Gift card"} deleted successfully.`,
				acknowledgeSuccess,
			);
		} catch {
			locked.current = false;
			showMessage("Error", `Failed to delete ${item}. Please try again.`);
		} finally {
			setIsDeleting(false);
		}
	};
	const handleDelete = () => {
		if (locked.current || isDisabled) return;
		const title = `Delete ${item}`;
		const message = `Are you sure you want to delete this ${item}? This action cannot be undone.`;
		if (Platform.OS === "web")
			setDialog({
				title,
				message,
				onConfirm: () => {
					void performDelete();
				},
				onClose: closeDialog,
			});
		else
			Alert.alert(title, message, [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						void performDelete();
					},
				},
			]);
	};
	return (
		<>
			<Button
				onPress={handleDelete}
				disabled={isDeleting || isDisabled || isDeleted}
				mode="contained"
				className="rounded-3xl"
				buttonColor={colors.error}
				textColor={colors.onError}
				loading={isDeleting}
			>
				{isDeleting ? "Deleting..." : `Delete ${type}`}
			</Button>
			{Platform.OS === "web" && !sharedDialog ? (
				<DeleteDialog dialog={dialog} />
			) : null}
		</>
	);
};
