import { useContext } from "react";
import {
	I18nProvider,
	RangeCalendar,
	RangeCalendarStateContext,
} from "react-aria-components";
import { useTheme } from "react-native-paper";
import {
	CalendarDays,
	CalendarHeader,
	calendarDate,
	calendarValue,
	RangeSelectionStatus,
} from "./calendar.web";
import type { DateRangeControlProps } from "./date-range-control";

export function DateRangeControl({
	startDate,
	endDate,
	maximumDate,
	onChange,
	onPendingChange,
}: DateRangeControlProps) {
	const { colors } = useTheme();
	return (
		<I18nProvider locale="en-CA">
			<div style={{ color: colors.onSurface, fontFamily: "inherit" }}>
				<RangeCalendar
					autoFocus
					aria-label="Report date range"
					value={{
						start: calendarValue(startDate),
						end: calendarValue(endDate),
					}}
					defaultFocusedValue={calendarValue(startDate)}
					maxValue={calendarValue(maximumDate)}
					onChange={(range) => {
						const start = calendarDate(range.start, undefined, maximumDate);
						const end = calendarDate(
							range.end,
							start ?? undefined,
							maximumDate,
						);
						if (start && end) onChange(start, end);
					}}
				>
					{({ state }) => (
						<>
							<RangeSummary startDate={startDate} endDate={endDate} />
							<CalendarHeader state={state} />
							<CalendarDays range />
							<RangeSelectionStatus onPendingChange={onPendingChange} />
						</>
					)}
				</RangeCalendar>
			</div>
		</I18nProvider>
	);
}

function RangeSummary({
	startDate,
	endDate,
}: {
	startDate: Date;
	endDate: Date;
}) {
	const state = useContext(RangeCalendarStateContext);
	const { colors } = useTheme();
	const anchor = state?.anchorDate ? calendarDate(state.anchorDate) : null;
	const format = (date: Date) =>
		date.toLocaleDateString("en-CA", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	return (
		<div
			aria-live="polite"
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: 12,
				padding: 12,
				marginBottom: 18,
				background: colors.surfaceVariant,
				borderRadius: 12,
			}}
		>
			{[
				{ label: "From", value: format(anchor ?? startDate) },
				{ label: "To", value: anchor ? "Choose end date" : format(endDate) },
			].map(({ label, value }) => (
				<div key={label} style={{ flex: 1, minWidth: 110 }}>
					<div
						style={{
							fontSize: 12,
							marginBottom: 4,
							color: colors.onSurfaceVariant,
						}}
					>
						{label}
					</div>
					<strong style={{ fontSize: 14 }}>{value}</strong>
				</div>
			))}
		</div>
	);
}
