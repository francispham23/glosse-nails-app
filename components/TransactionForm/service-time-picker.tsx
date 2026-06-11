import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "react-native-paper";

import type { EarningFormState } from "@/utils";

interface ServiceTimePickerProps {
	serviceDate: EarningFormState["serviceDate"];
	open: boolean;
	setOpen: (open: boolean) => void;
	endOfDay: Date;
	mutedColor: string;
	onDateChange: (_: unknown, selectedDate: Date | undefined) => void;
}

export function ServiceTimePicker({
	serviceDate,
	open,
	setOpen,
	endOfDay,
	mutedColor,
	onDateChange,
}: ServiceTimePickerProps) {
	return (
		<>
			<TextInput
				mode="outlined"
				className="h-16 rounded-3xl"
				placeholder="Select service time"
				value={new Date(serviceDate).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
				editable={false}
				onPressIn={() => setOpen(!open)}
				left={
					<TextInput.Icon icon="clock-outline" size={22} color={mutedColor} />
				}
			/>
			{open ? (
				<DateTimePicker
					mode="time"
					value={new Date(serviceDate)}
					maximumDate={endOfDay}
					display="spinner"
					onValueChange={onDateChange}
				/>
			) : null}
		</>
	);
}
