import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export const PickDateButton = () => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");

	return (
		<Pressable
			className="justify-center rounded-full px-3"
			onPress={() => router.navigate("/pick-date")}
		>
			<Ionicons name="calendar" size={18} color={themeColorForeground} />
		</Pressable>
	);
};
