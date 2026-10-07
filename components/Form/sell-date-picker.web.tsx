import { useState } from "react";
import { Calendar, I18nProvider } from "react-aria-components";
import { TextInput, useTheme } from "react-native-paper";
import {
	CalendarDays,
	CalendarHeader,
	calendarDate,
	calendarValue,
} from "@/components/workspace/calendar.web";
import { mergeLocalCalendarDay } from "@/utils/local-datetime";

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
				<TextInput
					mode="outlined"
					className="h-16 rounded-3xl"
					placeholder="Select service date"
					value={date.toLocaleDateString([])}
					editable={false}
					onPressIn={() => setOpen((value) => !value)}
					left={<TextInput.Icon icon="calendar-outline" color={mutedColor} />}
				/>
				{open ? (
					<div style={{ marginTop: 12 }}>
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
					</div>
				) : null}
			</div>
		</I18nProvider>
	);
}
