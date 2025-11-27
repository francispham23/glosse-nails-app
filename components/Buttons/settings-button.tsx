import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export const SettingsButton = () => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");

	return (
		<Pressable
			className="justify-center rounded-full p-2.5"
			onPress={() => {
				router.navigate("/settings");
			}}
		>
			<Ionicons
				name="settings-outline"
				size={18}
				color={themeColorForeground}
			/>
		</Pressable>
	);
};
