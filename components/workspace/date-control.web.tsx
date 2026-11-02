import { Calendar, I18nProvider } from "react-aria-components";
import { useTheme } from "react-native-paper";
import {
	CalendarDays,
	CalendarHeader,
	calendarDate,
	calendarValue,
} from "./calendar.web";
import type { DateControlProps } from "./date-control";

export function DateControl({
	label,
	value,
	minimumDate,
	maximumDate,
	onChange,
}: DateControlProps) {
	const { colors } = useTheme();
	return (
		<I18nProvider locale="en-CA">
			<div style={{ color: colors.onSurface, fontFamily: "inherit" }}>
				<p
					aria-live="polite"
					style={{
						margin: "0 0 18px",
						color: colors.onSurfaceVariant,
						fontSize: 14,
					}}
				>
					{label}:{" "}
					<strong style={{ color: colors.onSurface }}>
						{value.toLocaleDateString("en-CA", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</strong>
				</p>
				<Calendar
					autoFocus
					aria-label={label}
					value={calendarValue(value)}
					minValue={minimumDate ? calendarValue(minimumDate) : undefined}
					maxValue={maximumDate ? calendarValue(maximumDate) : undefined}
					onChange={(next) => {
						const selected = calendarDate(next, minimumDate, maximumDate);
						if (selected) onChange(selected);
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
		</I18nProvider>
	);
}
