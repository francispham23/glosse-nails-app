import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
	createContext,
	type PropsWithChildren,
	type ReactNode,
	useContext,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Portal, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDate } from "@/contexts/app-date-context";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";
import { type WorkspaceAction, WorkspaceActions } from "./actions";

const FloatingControlsContext = createContext(false);

export function WorkspaceListFooter() {
	const floating = useContext(FloatingControlsContext);
	return floating ? <View style={{ height: 96 }} /> : null;
}

export function WorkspaceScreen({
	title,
	description,
	dateControl = false,
	actions,
	mobileAction,
	children,
}: PropsWithChildren<{
	title: string;
	description: string;
	dateControl?: boolean;
	actions?: ReactNode;
	mobileAction?: WorkspaceAction;
}>) {
	const { colors } = useTheme();
	const { isCompact } = useWorkspaceLayout();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { date } = useAppDate();
	const { isLight, toggleTheme } = useAppTheme();
	const floatingActions: WorkspaceAction[] = [
		...(dateControl
			? [
					{
						icon: "calendar-blank-outline",
						label: `Choose date · ${date?.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}`,
						accessibilityLabel: `Choose date: ${date?.toLocaleDateString("en-CA")}`,
						onPress: () => router.navigate("/pick-date"),
					},
				]
			: []),
		...(mobileAction ? [mobileAction] : []),
	];
	return (
		<Portal.Host>
			<View
				style={[
					styles.screen,
					{ backgroundColor: colors.background, paddingTop: insets.top },
				]}
			>
				<View
					style={[styles.content, { paddingHorizontal: isCompact ? 16 : 32 }]}
				>
					<View style={styles.header}>
						<View style={styles.heading}>
							<Text accessibilityRole="header" style={styles.title}>
								{title}
							</Text>
							<Text style={{ color: colors.onSurfaceVariant, lineHeight: 22 }}>
								{description}
							</Text>
						</View>
						<View style={styles.tools}>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={
									isLight ? "Use dark theme" : "Use light theme"
								}
								onPress={toggleTheme}
								style={styles.iconButton}
							>
								<Ionicons
									name={isLight ? "moon-outline" : "sunny-outline"}
									size={20}
									color={colors.onSurfaceVariant}
								/>
							</Pressable>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Settings"
								onPress={() => router.navigate("/settings")}
								style={styles.iconButton}
							>
								<Ionicons
									name="settings-outline"
									size={20}
									color={colors.onSurfaceVariant}
								/>
							</Pressable>
						</View>
					</View>
					{dateControl || actions ? (
						<View style={!isCompact ? styles.toolbar : undefined}>
							{dateControl && !isCompact ? (
								<Button
									mode="outlined"
									compact={isCompact}
									icon="calendar-blank-outline"
									onPress={() => router.navigate("/pick-date")}
									contentStyle={{ minHeight: isCompact ? 48 : 44 }}
									labelStyle={isCompact ? { fontSize: 13 } : undefined}
									textColor={colors.onSurface}
									style={{ borderColor: colors.outline }}
								>
									{date?.toLocaleDateString("en-CA", {
										weekday: isCompact ? undefined : "short",
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</Button>
							) : null}
							{actions}
						</View>
					) : null}
					<View style={styles.body}>
						<FloatingControlsContext.Provider
							value={isCompact && !!(dateControl || actions)}
						>
							{children}
						</FloatingControlsContext.Provider>
					</View>
				</View>
				<WorkspaceActions actions={floatingActions} name={title} />
			</View>
		</Portal.Host>
	);
}

export const workspaceStyles = StyleSheet.create({
	list: { paddingTop: 8, paddingBottom: 32, gap: 12, flexGrow: 1 },
	row: {
		padding: 16,
		gap: 16,
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	name: { flex: 1, minWidth: 100, gap: 4 },
	numbers: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 24,
		maxWidth: "100%",
		minWidth: 0,
		flexShrink: 1,
	},
	amount: {
		textAlign: "right",
		fontSize: 16,
		fontWeight: "600",
		fontVariant: ["tabular-nums"],
	},
	label: { fontSize: 12, lineHeight: 18 },
	card: {
		borderWidth: 1,
		borderRadius: 16,
		borderCurve: "continuous",
		overflow: "hidden",
	},
});

const styles = StyleSheet.create({
	screen: { flex: 1, minWidth: 0 },
	content: {
		flex: 1,
		width: "100%",
		maxWidth: 1200,
		alignSelf: "center",
		minWidth: 0,
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		paddingTop: 24,
		paddingBottom: 24,
	},
	heading: { flex: 1, minWidth: 0, gap: 8 },
	title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.6 },
	tools: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-end",
		maxWidth: 88,
	},
	iconButton: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
		borderCurve: "continuous",
	},
	toolbar: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: 12,
		paddingBottom: 20,
	},
	body: { flex: 1, minHeight: 0 },
});
