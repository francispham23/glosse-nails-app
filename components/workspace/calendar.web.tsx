import { CalendarDate } from "@internationalized/date";
import { useContext, useEffect, useState } from "react";
import {
	Button,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	type CalendarRenderProps,
	Heading,
	RangeCalendarStateContext,
} from "react-aria-components";
import { useTheme } from "react-native-paper";
import { parseDateInput } from "./date-value";

export function calendarValue(date: Date) {
	return new CalendarDate(
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
	);
}

export function calendarDate(
	value: CalendarDate,
	minimum?: Date,
	maximum?: Date,
) {
	return parseDateInput(value.toString(), minimum, maximum);
}

export function CalendarHeader({
	state,
}: {
	state: Pick<CalendarRenderProps["state"], "visibleRange" | "setFocusedDate">;
}) {
	const { colors } = useTheme();
	const date = state.visibleRange.start;
	const [yearText, setYearText] = useState(String(date.year));
	const [trackedYear, setTrackedYear] = useState(date.year);
	if (date.year !== trackedYear) {
		setTrackedYear(date.year);
		setYearText(String(date.year));
	}
	const commitYear = (text: string) => {
		if (!/^\d{4}$/.test(text)) return false;
		const year = Number(text);
		if (!Number.isInteger(year) || year < 1 || year > 9999) return false;
		state.setFocusedDate(date.set({ year }));
		return true;
	};
	const controlStyle = {
		minHeight: 44,
		border: `1px solid ${colors.outlineVariant}`,
		borderRadius: 10,
		background: colors.surface,
		color: colors.onSurface,
		font: "inherit",
	};
	const monthOptions = Array.from({ length: 12 }, (_, month) => ({
		value: month + 1,
		label: new Date(2020, month, 1).toLocaleDateString("en-CA", {
			month: "long",
		}),
	}));
	return (
		<header
			style={{
				display: "flex",
				gap: 6,
				alignItems: "center",
				marginBottom: 14,
			}}
		>
			<Heading
				style={{
					position: "absolute",
					width: 1,
					height: 1,
					overflow: "hidden",
					clipPath: "inset(50%)",
				}}
			/>
			<Button
				slot="previous"
				aria-label="Previous month"
				style={({ isDisabled }) => ({
					...controlStyle,
					width: 40,
					flexShrink: 0,
					opacity: isDisabled ? 0.35 : 1,
					cursor: isDisabled ? "default" : "pointer",
					fontSize: 22,
				})}
			>
				‹
			</Button>
			<select
				aria-label="Month"
				value={date.month}
				onChange={(event) =>
					state.setFocusedDate(date.set({ month: Number(event.target.value) }))
				}
				style={{
					...controlStyle,
					minWidth: 0,
					flex: 1,
					padding: "0 6px",
					fontWeight: 600,
				}}
			>
				{monthOptions.map(({ value, label }) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
			<input
				aria-label="Year"
				type="number"
				min={1}
				max={9999}
				value={yearText}
				onChange={(event) => {
					const next = event.target.value;
					setYearText(next);
					if (/^\d{4}$/.test(next)) commitYear(next);
				}}
				onBlur={() => {
					if (!commitYear(yearText)) setYearText(String(date.year));
				}}
				style={{
					...controlStyle,
					width: 76,
					padding: "0 6px",
					boxSizing: "border-box",
					fontWeight: 600,
				}}
			/>
			<Button
				slot="next"
				aria-label="Next month"
				style={({ isDisabled }) => ({
					...controlStyle,
					width: 40,
					flexShrink: 0,
					opacity: isDisabled ? 0.35 : 1,
					cursor: isDisabled ? "default" : "pointer",
					fontSize: 22,
				})}
			>
				›
			</Button>
		</header>
	);
}

export function CalendarDays({ range = false }: { range?: boolean }) {
	const { colors } = useTheme();
	return (
		<CalendarGrid
			weekdayStyle="short"
			style={{
				width: "100%",
				tableLayout: "fixed",
				borderCollapse: "collapse",
			}}
		>
			<CalendarGridHeader>
				{(day) => (
					<CalendarHeaderCell
						style={{
							padding: "0 0 10px",
							color: colors.onSurfaceVariant,
							fontSize: 12,
							fontWeight: 500,
						}}
					>
						{day}
					</CalendarHeaderCell>
				)}
			</CalendarGridHeader>
			<CalendarGridBody>
				{(date) => (
					<CalendarCell
						date={date}
						style={({
							isSelected,
							isSelectionStart,
							isSelectionEnd,
							isDisabled,
							isOutsideMonth,
							isFocusVisible,
							isHovered,
						}) => {
							const endpoint =
								isSelected && (!range || isSelectionStart || isSelectionEnd);
							return {
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								minHeight: 44,
								margin: "2px 0",
								fontSize: 14,
								fontWeight: isSelected ? 700 : 400,
								borderRadius: endpoint ? 12 : isSelected ? 0 : 12,
								background: endpoint
									? colors.primary
									: isSelected
										? colors.primaryContainer
										: isHovered && !isDisabled
											? colors.surfaceVariant
											: "transparent",
								color: endpoint
									? colors.onPrimary
									: isSelected
										? colors.onPrimaryContainer
										: colors.onSurface,
								opacity: isDisabled ? 0.3 : isOutsideMonth ? 0.45 : 1,
								outline: isFocusVisible
									? `2px solid ${colors.primary}`
									: "none",
								outlineOffset: -2,
								cursor: isDisabled ? "default" : "pointer",
							};
						}}
					/>
				)}
			</CalendarGridBody>
		</CalendarGrid>
	);
}

export function RangeSelectionStatus({
	onPendingChange,
}: {
	onPendingChange?: (pending: boolean) => void;
}) {
	const state = useContext(RangeCalendarStateContext);
	const pending = Boolean(state?.anchorDate);
	const { colors } = useTheme();
	useEffect(() => onPendingChange?.(pending), [pending, onPendingChange]);
	return (
		<p
			role="status"
			style={{
				color: colors.onSurfaceVariant,
				fontSize: 12,
				margin: "12px 0 0",
			}}
		>
			{pending
				? "Choose the end date to complete your range."
				: "Choose a start date, then an end date."}
		</p>
	);
}
