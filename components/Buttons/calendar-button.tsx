import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, Pressable } from "react-native";

export const CalendarButton = () => {
	const [open, setOpen] = useState(false);
	const themeColorForeground = useThemeColor("foreground");

	const handleOnPress = () => {
		setOpen(true);
		Alert.alert("Calendar Button Pressed", "You pressed the calendar button.", [
			{ text: "OK", onPress: () => setOpen(false) },
		]);
	};

	return (
		<Pressable
			className="justify-center rounded-full px-3"
			disabled={open}
			onPress={handleOnPress}
		>
			<Ionicons name="calendar" size={18} color={themeColorForeground} />
		</Pressable>
	);
};
