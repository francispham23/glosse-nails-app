import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

// Match workspace rows and the gift-details close control.
export const controlGeometry = { radius: 16, fieldHeight: 64, iconSize: 24 };
export const controlStyles = StyleSheet.create({
	field: { minHeight: 64, borderRadius: 16, fontSize: 16 },
	outline: { borderRadius: 16 },
	fieldContent: { fontSize: 16 },
	title: {
		fontSize: 28,
		lineHeight: 36,
		fontWeight: "700",
		letterSpacing: -0.6,
	},
	description: { fontSize: 16, lineHeight: 22 },
	button: { borderRadius: 16 },
	buttonContent: { minHeight: 48 },
	chip: { borderRadius: 16 },
	headerTarget: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	headerBack: {
		minHeight: 44,
		paddingHorizontal: 8,
		borderRadius: 22,
		flexDirection: "row",
		gap: 4,
		alignItems: "center",
		justifyContent: "center",
	},
	headerLabel: { minHeight: 44, paddingHorizontal: 8 },
});

// A true 44px target on web/native, surrounding the reference modal's 40px circle.
export function HeaderIconSurface({ children }: PropsWithChildren) {
	const { colors } = useTheme();
	return (
		<View
			style={[
				controlStyles.headerButton,
				{ backgroundColor: colors.surfaceVariant },
			]}
		>
			{children}
		</View>
	);
}
