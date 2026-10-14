import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren } from "react";
import { Platform, Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { workspaceStyles } from "./screen";

export function OverviewCard({
	children,
	onPress,
	label,
	disabled = false,
	selected,
	selecting = false,
}: PropsWithChildren<{
	onPress: () => void;
	label: string;
	disabled?: boolean;
	selected?: boolean;
	selecting?: boolean;
}>) {
	const { colors } = useTheme();
	return (
		<Pressable
			onPress={onPress}
			{...(Platform.OS === "web" && selecting
				? {
						onKeyDown: (event: {
							key: string;
							repeat?: boolean;
							preventDefault: () => void;
						}) => {
							if (event.key === " " || event.key === "Spacebar") {
								event.preventDefault();
								if (!disabled && !event.repeat) onPress();
							}
						},
					}
				: {})}
			disabled={disabled}
			accessibilityRole={selecting ? "checkbox" : "button"}
			accessibilityLabel={label}
			aria-disabled={disabled}
			aria-checked={selecting ? !!selected : undefined}
			accessibilityState={{
				disabled,
				...(selecting ? { checked: !!selected } : {}),
			}}
			style={({ pressed }) => [
				workspaceStyles.card,
				{
					borderColor: selected ? colors.primary : colors.outlineVariant,
					backgroundColor:
						pressed || selected ? colors.primaryContainer : colors.surface,
				},
			]}
		>
			{children}
		</Pressable>
	);
}

export function Amount({ label, value }: { label: string; value: string }) {
	const { colors } = useTheme();
	return (
		<View style={{ gap: 4, flexShrink: 1, minWidth: 0, maxWidth: "100%" }}>
			<Text
				style={[
					workspaceStyles.label,
					{ textAlign: "right", color: colors.onSurfaceVariant },
				]}
			>
				{label}
			</Text>
			<Text style={workspaceStyles.amount}>{value}</Text>
		</View>
	);
}

export function RowIndicator({
	selecting,
	selected,
}: {
	selecting?: boolean;
	selected?: boolean;
}) {
	const { colors } = useTheme();
	return (
		<Ionicons
			name={
				selecting
					? selected
						? "checkbox"
						: "square-outline"
					: "chevron-forward"
			}
			size={20}
			color={selecting ? colors.primary : colors.onSurfaceVariant}
		/>
	);
}
