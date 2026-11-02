import type { PropsWithChildren, ReactNode } from "react";
import {
	Button,
	Dialog,
	Heading,
	Modal,
	ModalOverlay,
} from "react-aria-components";
import { useTheme } from "react-native-paper";
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
	return (
		<ModalOverlay
			isOpen={visible}
			isDismissable
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 10000,
				background: "rgba(0,0,0,0.45)",
				display: "flex",
				alignItems: isCompact ? "flex-end" : "center",
				justifyContent: "center",
				padding: isCompact ? 0 : 24,
				boxSizing: "border-box",
			}}
		>
			<Modal
				style={{
					width: "100%",
					maxWidth: isCompact ? 600 : 420,
					maxHeight: "90dvh",
					display: "flex",
					background: colors.surface,
					color: colors.onSurface,
					borderRadius: isCompact ? "20px 20px 0 0" : 20,
					boxShadow: "0 20px 64px rgba(0,0,0,0.2)",
					overflow: "hidden",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				<Dialog
					style={{
						width: "100%",
						minWidth: 0,
						minHeight: 0,
						display: "flex",
						flexDirection: "column",
						outline: "none",
						padding: isCompact
							? "18px 16px max(16px, env(safe-area-inset-bottom))"
							: 24,
						boxSizing: "border-box",
						gap: 18,
					}}
				>
					<header
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 12,
						}}
					>
						<Heading
							slot="title"
							style={{ margin: 0, fontSize: 22, fontWeight: 700 }}
						>
							{title}
						</Heading>
						<Button
							aria-label="Close date picker"
							onPress={onClose}
							style={{
								width: 44,
								height: 44,
								flexShrink: 0,
								border: 0,
								borderRadius: 12,
								color: colors.onSurfaceVariant,
								background: colors.surfaceVariant,
								cursor: "pointer",
								fontSize: 24,
							}}
						>
							×
						</Button>
					</header>
					<div
						style={{
							overflowY: "auto",
							minHeight: 0,
							display: "flex",
							flexDirection: "column",
							gap: 18,
						}}
					>
						{children}
					</div>
					<footer
						style={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "flex-end",
							gap: 12,
							paddingTop: 14,
							borderTop: `1px solid ${colors.outlineVariant}`,
						}}
					>
						{actions}
					</footer>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
