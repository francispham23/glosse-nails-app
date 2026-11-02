import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { TextInput } from "react-native-paper";

interface SellDatePickerProps {
	date: Date;
	maximumDate: Date;
	mutedColor: string;
	onChange: (date: Date) => void;
}

export function SellDatePicker({
	date,
	maximumDate,
	mutedColor,
	onChange,
}: SellDatePickerProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder="Select service date"
				value={date.toLocaleDateString([])}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={<TextInput.Icon icon="calendar-outline" color={mutedColor} />}
			/>
			{open ? (
				<DateTimePicker
					mode="date"
					value={date}
					maximumDate={maximumDate}
					display="spinner"
					onChange={(_, selectedDate) => {
						if (selectedDate) onChange(selectedDate);
						setOpen(false);
					}}
				/>
			) : null}
		</>
	);
}
