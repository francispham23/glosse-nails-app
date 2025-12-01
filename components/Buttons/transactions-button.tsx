import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export const TransactionsButton = () => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");
	return (
		<Pressable
			onPress={() => {
				// TODO: Navigate to transactions screen of the technician
				router.navigate("/transactions");
			}}
			className="justify-center rounded-full p-2"
		>
			<Ionicons
				name="swap-horizontal-outline"
				size={22}
				color={themeColorForeground}
			/>
		</Pressable>
	);
};
