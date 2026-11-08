import { FormTextInput as TextInput } from "@/components/Form/form-text-input";
import DateTimePicker from "@/components/Form/salon-date-time-picker";
import type { EarningFormState } from "@/utils";
import { salonTimeString } from "@/utils/salon-time";

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
				placeholder="Select service time"
				value={salonTimeString(new Date(serviceDate), [], {
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
