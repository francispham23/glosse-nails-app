import { useState } from "react";
import { Calendar, I18nProvider } from "react-aria-components";
import { useTheme } from "react-native-paper";
import {
	CalendarDays,
	CalendarHeader,
	calendarDate,
	calendarValue,
} from "@/components/workspace/calendar.web";
import { mergeLocalCalendarDay } from "@/utils/local-datetime";
import { PickerField } from "./picker-field.web";

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
	const { colors } = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<I18nProvider locale="en-CA">
			<div style={{ color: colors.onSurface, fontFamily: "inherit" }}>
				<PickerField
					label="Select service date"
					value={date.toLocaleDateString([])}
					open={open}
					setOpen={setOpen}
					icon="calendar"
					mutedColor={mutedColor}
				>
					<Calendar
						autoFocus
						aria-label="Gift card sell date"
						value={calendarValue(date)}
						maxValue={calendarValue(maximumDate)}
						onChange={(next) => {
							const selected = calendarDate(next, undefined, maximumDate);
							if (selected) {
								onChange(mergeLocalCalendarDay(date, selected));
								setOpen(false);
							}
						}}
					>
						{({ state }) => (
							<>
								<CalendarHeader state={state} />
								<CalendarDays />
							</>
						)}
					</Calendar>
				</PickerField>
			</div>
		</I18nProvider>
	);
}
