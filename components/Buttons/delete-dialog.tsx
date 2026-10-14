import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useState,
} from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export type DeleteDialogState = {
	title: string;
	message: string;
	onConfirm?: () => void;
	onClose: () => void;
	pending?: boolean;
};

// Deleted records disappear as soon as their subscriptions update.
// Keep their confirmation and result feedback in the surviving screen.
export const DeleteDialogContext = createContext<Dispatch<
	SetStateAction<DeleteDialogState | null>
> | null>(null);

export function DeleteDialogProvider({ children }: PropsWithChildren) {
	const [dialog, setDialog] = useState<DeleteDialogState | null>(null);
	return (
		<DeleteDialogContext.Provider value={setDialog}>
			{children}
			{dialog ? <DeleteDialog dialog={dialog} /> : null}
		</DeleteDialogContext.Provider>
	);
}

export function DeleteDialog({ dialog }: { dialog: DeleteDialogState | null }) {
	const { colors } = useTheme();
	if (!dialog) return null;
	return (
		<Modal
			visible
			transparent
			animationType="none"
			accessibilityLabel={dialog.title}
			onRequestClose={() => {
				if (!dialog.pending) dialog.onClose();
			}}
		>
			<View style={styles.overlay}>
				<Pressable
					style={StyleSheet.absoluteFill}
					accessible={false}
					testID="delete-dialog-backdrop"
					onPress={() => {
						if (!dialog.pending) dialog.onClose();
					}}
				/>
				<View style={[styles.dialog, { backgroundColor: colors.surface }]}>
					<Text variant="titleLarge" accessibilityRole="header">
						{dialog.title}
					</Text>
					<Text
						variant="bodyMedium"
						accessibilityRole={dialog.onConfirm ? undefined : "alert"}
					>
						{dialog.message}
					</Text>
					<View style={styles.actions}>
						<Button disabled={dialog.pending} onPress={dialog.onClose}>
							{dialog.onConfirm ? "Cancel" : "OK"}
						</Button>
						{dialog.onConfirm ? (
							<Button
								mode="contained"
								buttonColor={colors.error}
								textColor={colors.onError}
								disabled={dialog.pending}
								loading={dialog.pending}
								onPress={dialog.onConfirm}
							>
								{dialog.pending ? "Deleting..." : "Delete"}
							</Button>
						) : null}
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "rgba(0,0,0,0.45)",
	},
	dialog: {
		width: "100%",
		maxWidth: 440,
		borderRadius: 20,
		padding: 24,
		gap: 20,
	},
	actions: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		gap: 8,
	},
});
