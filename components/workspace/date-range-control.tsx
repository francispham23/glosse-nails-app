import { DateControl } from "./date-control";

export type DateRangeControlProps = {
	startDate: Date;
	endDate: Date;
	maximumDate: Date;
	onChange: (start: Date, end: Date) => void;
	onPendingChange?: (pending: boolean) => void;
};

// Native pickers keep the existing From/To interaction.
export function DateRangeControl({
	startDate,
	endDate,
	maximumDate,
	onChange,
}: DateRangeControlProps) {
	return (
		<>
			<DateControl
				label="From"
				value={startDate}
				maximumDate={endDate}
				onChange={(date) => onChange(date, endDate)}
			/>
			<DateControl
				label="To"
				value={endDate}
				minimumDate={startDate}
				maximumDate={maximumDate}
				onChange={(date) => onChange(startDate, date)}
			/>
		</>
	);
}
