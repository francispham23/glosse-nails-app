import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const tintColor = useThemeColor("foreground");
	const inactiveTintColor = useThemeColor("muted");

	// get the device bottom inset so we can expand the tab background under the home indicator
	const insets = useSafeAreaInsets();

	// base tab bar height — tweak this if you want a taller bar
	const BASE_BAR_HEIGHT = 56;
	const bgHeight = BASE_BAR_HEIGHT + insets.bottom;
	const bgColor = useThemeColor("background-secondary");

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tintColor,
				tabBarInactiveTintColor: inactiveTintColor,
				//? Make the actual bar transparent (we render a background view that covers the full safe-area + base height so the background extends to the bottom of the device)
				tabBarStyle: {
					backgroundColor: "transparent",
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: bgHeight,
					borderTopWidth: 0,
					//? Keep the safe-area portion reserved for the home indicator; we'll ender tab items inside the BASE_BAR_HEIGHT segment above it.
					paddingBottom: 0,
				},
				//? Render a background behind the bar that spans the full bottom safe area
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
				//? Make each tab item sit inside a BASE_BAR_HEIGHT area that's vertically aligned to the lower edge so labels/icons appear near the device bottom.
				tabBarItemStyle: {
					height: BASE_BAR_HEIGHT,
					//? We want the icon + label visually lower in the item area — center the content then add top padding so it sits lower.
					justifyContent: "center",
					alignItems: "center",
					//? Add extra top padding to push content down toward the device bottom.
					//? Use a small fraction of the safe area so devices with larger home
					//? indicators get slightly more push.
					paddingTop: Math.max(10, Math.round(insets.bottom * 0.4)),
					//? Keep a small bottom padding so content doesn't overlap the very edge
					paddingBottom: Math.max(4, Math.round(insets.bottom * 0.12)),
				},
				//? minor icon/label tweaks so the two line label+icon layout sits close to bottom
				//? Pull the icon down a bit and reduce label spacing for a tight look
				tabBarIconStyle: { marginBottom: -4 },
				tabBarLabelStyle: { marginTop: 0 },
			}}
		>
			<Tabs.Screen
				name="earnings"
				options={{
					title: "Earning",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="cash-outline" color={color} size={size} />
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="transactions"
				options={{
					title: "Transactions",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="swap-horizontal-outline"
							color={color}
							size={size}
						/>
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
