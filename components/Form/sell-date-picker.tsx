import { useState } from "react";
import { FormTextInput as TextInput } from "@/components/Form/form-text-input";
import DateTimePicker from "@/components/Form/salon-date-time-picker";
import { salonDateString } from "@/utils/salon-time";

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
				placeholder="Select service date"
				value={salonDateString(date, [])}
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
