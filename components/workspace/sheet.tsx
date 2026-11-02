import type { PropsWithChildren, ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";

export function WorkspaceSheet({
	visible,
	title,
	onClose,
	actions,
	children,
}: PropsWithChildren<{
	visible: boolean;
	title: string;
	onClose: () => void;
	actions: ReactNode;
}>) {
	const { colors } = useTheme();
	const { isCompact } = useWorkspaceLayout();
	const insets = useSafeAreaInsets();
	return (
		<Modal
			transparent
			visible={visible}
			animationType="fade"
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={{
					flex: 1,
					justifyContent: isCompact ? "flex-end" : "center",
					alignItems: "center",
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Close date picker"
					onPress={onClose}
					style={{
						position: "absolute",
						inset: 0,
						backgroundColor: "rgba(0,0,0,0.45)",
					}}
				/>
				<View
					accessibilityViewIsModal
					style={{
						width: "100%",
						maxWidth: isCompact ? 600 : 440,
						maxHeight: "90%",
						padding: 24,
						paddingBottom: Math.max(24, insets.bottom),
						backgroundColor: colors.surface,
						borderRadius: 20,
						...(isCompact
							? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
							: {}),
						gap: 20,
					}}
				>
					<Text
						accessibilityRole="header"
						style={{ fontSize: 22, fontWeight: "700" }}
					>
						{title}
					</Text>
					<ScrollView
						style={{ flexShrink: 1 }}
						contentContainerStyle={{ gap: 20 }}
						keyboardShouldPersistTaps="handled"
					>
						{children}
					</ScrollView>
					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							justifyContent: "flex-end",
							gap: 12,
						}}
					>
						{actions}
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
