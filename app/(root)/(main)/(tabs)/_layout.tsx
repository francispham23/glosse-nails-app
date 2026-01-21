import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabConfig = {
	name: string;
	title: string;
	icon: ComponentProps<typeof Ionicons>["name"];
};

const TABS: TabConfig[] = [
	{ name: "earnings", title: "Earnings", icon: "cash-outline" },
	{
		name: "transactions",
		title: "Transactions",
		icon: "swap-horizontal-outline",
	},
	{ name: "gift-card", title: "Gift Card", icon: "gift-outline" },
	{ name: "reports", title: "Reports", icon: "stats-chart-outline" },
];

const BASE_BAR_HEIGHT = 56;

export default function TabLayout() {
	const tintColor = useThemeColor("foreground");
	const inactiveTintColor = useThemeColor("muted");
	const bgColor = useThemeColor("background-secondary");
	const insets = useSafeAreaInsets();
	const bgHeight = BASE_BAR_HEIGHT + insets.bottom;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tintColor,
				tabBarInactiveTintColor: inactiveTintColor,
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "transparent",
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: bgHeight,
					borderTopWidth: 0,
					paddingBottom: 0,
				},
				tabBarBackground: () => (
					<View
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							bottom: 0,
							height: bgHeight,
							backgroundColor: bgColor,
							pointerEvents: "none",
						}}
					/>
				),
				tabBarItemStyle: {
					height: BASE_BAR_HEIGHT,
					justifyContent: "center",
					alignItems: "center",
					paddingTop: Math.max(10, Math.round(insets.bottom * 0.4)),
					paddingBottom: Math.max(4, Math.round(insets.bottom * 0.12)),
				},
				tabBarIconStyle: { marginBottom: -4 },
				tabBarLabelStyle: { marginTop: 0 },
			}}
		>
			{TABS.map((tab) => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{
						title: tab.title,
						tabBarIcon: ({ color, size }) => (
							<Ionicons name={tab.icon} color={color} size={size} />
						),
					}}
				/>
			))}
		</Tabs>
	);
}
