import DateTimePicker from "@react-native-community/datetimepicker";
import type { ComponentProps } from "react";
import { fromSalonWallDate, salonWallDate } from "@/utils/salon-time";

type Props = ComponentProps<typeof DateTimePicker>;
// Use a UTC picker for already-resolved salon clock fields. This also works on
// devices whose timezone database still contains Vancouver's old winter offset.
export default function SalonDateTimePicker({
	value,
	minimumDate,
	maximumDate,
	onChange,
	onValueChange,
	...props
}: Props) {
	return (
		<DateTimePicker
			{...props}
			timeZoneName="UTC"
			value={salonWallDate(value)}
			minimumDate={minimumDate && salonWallDate(minimumDate)}
			maximumDate={maximumDate && salonWallDate(maximumDate)}
			onChange={
				onChange &&
				((event, date) => onChange(event, date && fromSalonWallDate(date)))
			}
			onValueChange={
				onValueChange &&
				((event, date) => onValueChange(event, date && fromSalonWallDate(date)))
			}
		/>
	);
}
