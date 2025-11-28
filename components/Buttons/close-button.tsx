import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

export const CloseButton = () => {
	const themeColorForeground = useThemeColor("foreground");
	return (
		<Link href=".." asChild>
			<Pressable className="justify-center rounded-full p-2">
				<Ionicons name="close" size={22} color={themeColorForeground} />
			</Pressable>
		</Link>
	);
};
