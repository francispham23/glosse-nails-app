import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";

import type { User } from "@/utils/types";

interface Props {
	technicianId: User["_id"];
}

export const TransactionsButton = ({ technicianId }: Props) => {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground");
	return (
		<Pressable
			onPress={() => {
				router.push(`/(root)/(main)/technician/${technicianId}`);
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
