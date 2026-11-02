import { useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AccessibilityInfo,
	BackHandler,
	Platform,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import { FAB, Portal, useTheme } from "react-native-paper";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";

export type WorkspaceAction = {
	label: string;
	accessibilityLabel?: string;
	icon: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	direct?: boolean;
};

type WorkspaceActionsProps = { actions: WorkspaceAction[]; name: string };

export function WorkspaceActions(props: WorkspaceActionsProps) {
	const { isCompact } = useWorkspaceLayout();
	const focused = useIsFocused();
	return isCompact && focused && props.actions.length > 0 ? (
		<CompactActions {...props} />
	) : null;
}

function CompactActions({ actions, name }: WorkspaceActionsProps) {
	const { colors } = useTheme();
	const [open, setOpen] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	useEffect(() => {
		let active = true;
		void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
			if (active) setReducedMotion(value);
		});
		const subscription = AccessibilityInfo.addEventListener(
			"reduceMotionChanged",
			setReducedMotion,
		);
		return () => {
			active = false;
			subscription.remove();
		};
	}, []);
	const trigger = useRef<HTMLElement | null>(null);
	const close = useCallback(() => {
		setOpen(false);
		if (Platform.OS === "web") trigger.current?.focus();
	}, []);
	useEffect(() => {
		if (!open) return;
		const back = BackHandler.addEventListener("hardwareBackPress", () => {
			close();
			return true;
		});
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				close();
				return;
			}
		};
		if (Platform.OS === "web")
			document.addEventListener("keydown", handleKeyDown);
		return () => {
			back.remove();
			if (Platform.OS === "web")
				document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, close]);
	const direct = actions.find((action) => action.direct);
	const single = direct ?? (actions.length === 1 ? actions[0] : undefined);
	if (single)
		return (
			<Portal>
				<FAB
					icon={single.icon}
					label={direct ? single.label : undefined}
					accessibilityLabel={single.accessibilityLabel ?? single.label}
					disabled={single.disabled}
					loading={single.loading}
					onPress={() => {
						if (!single.disabled) single.onPress();
					}}
					style={{ position: "absolute", right: 16, bottom: 16 }}
				/>
			</Portal>
		);
	if (Platform.OS === "web")
		return (
			<Portal>
				{open ? (
					<Pressable
						testID="workspace-actions-backdrop"
						accessible={false}
						aria-hidden
						tabIndex={-1}
						onPress={close}
						style={[
							StyleSheet.absoluteFill,
							{ backgroundColor: colors.backdrop },
						]}
					/>
				) : null}
				<View
					style={{
						position: "absolute",
						right: 16,
						bottom: 16,
						gap: 16,
						alignItems: "flex-end",
					}}
				>
					{open
						? actions
								.filter((action) => !action.disabled)
								.map((action) => (
									<FAB
										key={action.label}
										icon={action.icon}
										label={action.label}
										accessibilityLabel={
											action.accessibilityLabel ?? action.label
										}
										loading={action.loading}
										onPress={() => {
											close();
											action.onPress();
										}}
									/>
								))
						: null}
					<FAB
						icon={open ? "close" : "dots-vertical"}
						accessibilityLabel={`${open ? "Close" : "Open"} ${name} actions`}
						aria-expanded={open}
						onPress={() => {
							if (open) close();
							else {
								trigger.current = document.activeElement as HTMLElement;
								setOpen(true);
							}
						}}
					/>
				</View>
			</Portal>
		);

	return (
		<Portal>
			<FAB.Group
				visible
				theme={{ animation: { scale: reducedMotion ? 0 : 1 } }}
				open={open}
				icon={open ? "close" : "dots-vertical"}
				accessibilityLabel={`${open ? "Close" : "Open"} ${name} actions`}
				actions={actions
					.filter((action) => !action.disabled)
					.map((action) => ({
						icon: action.icon,
						label: action.label,
						accessibilityLabel: action.accessibilityLabel ?? action.label,
						size: "medium" as const,
						onPress: () => {
							setOpen(false);
							action.onPress();
						},
					}))}
				onStateChange={({ open: next }) => {
					if (next) setOpen(true);
					else close();
				}}
				// The screen-local Portal host already ends above tabs and their safe area.
				style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}
			/>
		</Portal>
	);
}
