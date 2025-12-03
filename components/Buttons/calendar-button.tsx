import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

export const CalendarButton = () => {
	const [open, setOpen] = useState(false);
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
			<Text className="text-foreground">Calendar</Text>
		</Pressable>
	);
};
