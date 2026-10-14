import { ActivityIndicator, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export const ListEmptyComponent = ({
	item,
	loading = false,
}: {
	item?: string;
	loading?: boolean;
}) => {
	const { colors } = useTheme();
	return (
		<View
			style={{
				alignItems: "center",
				justifyContent: "center",
				padding: 32,
				gap: 12,
			}}
			accessibilityLiveRegion="polite"
		>
			{loading ? (
				<>
					<ActivityIndicator accessibilityLabel="Loading" />
					<Text style={{ color: colors.onSurfaceVariant }}>Loading…</Text>
				</>
			) : (
				<>
					<Text style={{ fontWeight: "600" }}>
						No {item ? `${item}s` : "data"} to display
					</Text>
					<Text style={{ color: colors.onSurfaceVariant, textAlign: "center" }}>
						Your records will appear here when available.
					</Text>
				</>
			)}
		</View>
	);
};
