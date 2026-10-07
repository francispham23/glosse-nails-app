import { Ionicons } from "@expo/vector-icons";
import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";

export const WORKSPACE_TABS = [
	{ name: "earnings", title: "Earnings", icon: "cash-outline" },
	{
		name: "transactions",
		title: "Transactions",
		icon: "swap-horizontal-outline",
	},
	{ name: "gift-card", title: "Gift Cards", icon: "gift-outline" },
	{ name: "reports", title: "Reports", icon: "stats-chart-outline" },
] as const;

type TabBarProps = Parameters<
	NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

export function WorkspaceNavigation({ state, navigation }: TabBarProps) {
	const { colors } = useTheme();
	const { mode, isCompact, navigationWidth } = useWorkspaceLayout();
	const insets = useSafeAreaInsets();
	const items = state.routes.map((route, index) => {
		const tab = WORKSPACE_TABS.find((item) => item.name === route.name);
		if (!tab) return null;
		const selected = state.index === index;
		return (
			<Pressable
				key={route.key}
				accessibilityRole="tab"
				accessibilityLabel={tab.title}
				accessibilityState={{ selected }}
				aria-selected={selected}
				onPress={() => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});
					if (!selected && !event.defaultPrevented)
						navigation.navigate(route.name, route.params);
				}}
				onLongPress={() =>
					navigation.emit({ type: "tabLongPress", target: route.key })
				}
				style={[
					styles.item,
					isCompact
						? styles.bottomItem
						: mode === "rail"
							? styles.railItem
							: styles.sidebarItem,
					{
						backgroundColor: selected ? colors.primaryContainer : "transparent",
					},
				]}
			>
				<Ionicons
					name={tab.icon}
					size={22}
					color={selected ? colors.primary : colors.onSurfaceVariant}
				/>
				<Text
					style={{
						fontSize: isCompact || mode === "rail" ? 11 : 14,
						fontWeight: selected ? "700" : "500",
						textAlign: "center",
						flexShrink: 1,
						color: selected
							? colors.onPrimaryContainer
							: colors.onSurfaceVariant,
					}}
				>
					{tab.title}
				</Text>
			</Pressable>
		);
	});
	return (
		<View
			style={[
				{ backgroundColor: colors.surface, borderColor: colors.outlineVariant },
				isCompact
					? {
							borderTopWidth: 1,
							paddingBottom: insets.bottom,
							paddingHorizontal: 8,
							paddingTop: 8,
						}
					: {
							borderRightWidth: 1,
							width: navigationWidth,
							paddingTop: insets.top + 24,
							paddingBottom: insets.bottom,
							paddingHorizontal: 12,
						},
			]}
		>
			{isCompact ? (
				<View style={styles.bottomItems}>{items}</View>
			) : (
				<ScrollView
					contentContainerStyle={{ gap: 8 }}
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.brand, { borderColor: colors.outlineVariant }]}>
						<View
							style={[styles.monogram, { backgroundColor: colors.primary }]}
						>
							<Text
								style={{
									color: colors.onPrimary,
									fontSize: 24,
									fontWeight: "700",
								}}
							>
								G
							</Text>
						</View>
						{mode === "sidebar" ? (
							<View style={{ gap: 4 }}>
								<Text style={{ fontSize: 20, fontWeight: "700" }}>
									Glossé Nails
								</Text>
								<Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
									Staff workspace
								</Text>
							</View>
						) : null}
					</View>
					{items}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	item: {
		minHeight: 56,
		borderRadius: 12,
		borderCurve: "continuous",
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
		padding: 8,
	},
	bottomItem: { flex: 1, minWidth: 0 },
	railItem: { paddingVertical: 16 },
	sidebarItem: {
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingHorizontal: 16,
	},
	bottomItems: { flexDirection: "row", gap: 4 },
	brand: { gap: 12, paddingBottom: 24, marginBottom: 16, borderBottomWidth: 1 },
	monogram: {
		width: 44,
		height: 44,
		borderRadius: 14,
		borderCurve: "continuous",
		alignItems: "center",
		justifyContent: "center",
	},
});
