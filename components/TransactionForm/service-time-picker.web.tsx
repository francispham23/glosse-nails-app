import { Time } from "@internationalized/date";
import {
	DateInput,
	DateSegment,
	I18nProvider,
	TimeField,
} from "react-aria-components";
import { useTheme } from "react-native-paper";
import { PickerField } from "@/components/Form/picker-field.web";
import type { EarningFormState } from "@/utils";
import { isAfterEndOfDay, mergeLocalTime } from "@/utils/local-datetime";

interface ServiceTimePickerProps {
	serviceDate: EarningFormState["serviceDate"];
	open: boolean;
	setOpen: (open: boolean) => void;
	endOfDay: Date;
	mutedColor: string;
	onDateChange: (_: unknown, selectedDate: Date | undefined) => void;
}

function serviceDateToTime(serviceDate: number) {
	const date = new Date(serviceDate);
	return new Time(date.getHours(), date.getMinutes());
}

export function ServiceTimePicker({
	serviceDate,
	open,
	setOpen,
	endOfDay,
	mutedColor,
	onDateChange,
}: ServiceTimePickerProps) {
	const { colors } = useTheme();
	const display = new Date(serviceDate).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<I18nProvider locale="en-CA">
			<div style={{ color: colors.onSurface, fontFamily: "inherit" }}>
				<PickerField
					label="Select service time"
					value={display}
					open={open}
					setOpen={setOpen}
					icon="clock"
					mutedColor={mutedColor}
				>
					<TimeField
						autoFocus
						aria-label="Service time"
						value={serviceDateToTime(serviceDate)}
						hourCycle={12}
						onChange={(time) => {
							if (!time) return;
							const timeSource = new Date(serviceDate);
							timeSource.setHours(time.hour, time.minute, 0, 0);
							const next = mergeLocalTime(new Date(serviceDate), timeSource);
							if (isAfterEndOfDay(next, endOfDay)) return;
							onDateChange(undefined, next);
						}}
					>
						<DateInput
							style={{
								display: "flex",
								gap: 4,
								padding: "12px 14px",
								borderRadius: 12,
								border: `1px solid ${colors.outlineVariant}`,
								background: colors.surface,
								fontSize: 18,
							}}
						>
							{(segment) => (
								<DateSegment
									segment={segment}
									style={{
										padding: "2px 4px",
										borderRadius: 4,
										outline: "none",
									}}
								/>
							)}
						</DateInput>
					</TimeField>
				</PickerField>
			</div>
		</I18nProvider>
	);
}
