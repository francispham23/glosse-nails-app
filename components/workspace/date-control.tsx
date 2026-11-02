import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

export type DateControlProps = {
	label: string;
	value: Date;
	minimumDate?: Date;
	maximumDate?: Date;
	onChange: (date: Date) => void;
};

export function DateControl({
	label,
	value,
	minimumDate,
	maximumDate,
	onChange,
}: DateControlProps) {
	const [open, setOpen] = useState(false);
	const { colors, dark } = useTheme();
	return (
		<View style={{ gap: 8, flexShrink: 1 }}>
			<Button
				mode="outlined"
				icon="calendar-blank-outline"
				accessibilityLabel={`${label}: ${value.toLocaleDateString()}`}
				textColor={colors.onSurface}
				contentStyle={{ minHeight: 48 }}
				onPress={() => setOpen(!open)}
			>
				{label}:{" "}
				{value.toLocaleDateString("en-CA", {
					month: "short",
					day: "numeric",
					year: "numeric",
				})}
			</Button>
			{open ? (
				<DateTimePicker
					value={value}
					minimumDate={minimumDate}
					maximumDate={maximumDate}
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					themeVariant={dark ? "dark" : "light"}
					textColor={colors.onSurface}
					onDismiss={() => setOpen(false)}
					onValueChange={(_, date) => {
						// iOS spinner reports every detent. Android's dialog reports the confirmed date.
						if (Platform.OS !== "ios") setOpen(false);
						if (date) onChange(date);
					}}
				/>
			) : null}
		</View>
	);
}
