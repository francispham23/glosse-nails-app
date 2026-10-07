import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, View } from "react-native";
import { Button } from "react-native-paper";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";
import { WorkspaceActions } from "./actions";
import { DateControl } from "./date-control";
import { DateRangeControl } from "./date-range-control";
import { getCompletedPayrollPeriod } from "./payroll-period";
import { WorkspaceSheet } from "./sheet";

export function ReportDateControls({
	startDate,
	endDate,
	maximumDate,
	onApply,
}: {
	startDate: Date;
	endDate: Date;
	maximumDate: Date;
	onApply: (start: Date, end: Date) => void;
}) {
	const { isCompact } = useWorkspaceLayout();
	const [open, setOpen] = useState(false);
	const [draftStart, setDraftStart] = useState(startDate);
	const [draftEnd, setDraftEnd] = useState(endDate);
	const [resetMaximumDate, setResetMaximumDate] = useState<Date | null>(null);
	const [selectionPending, setSelectionPending] = useState(false);
	const [selectionVersion, setSelectionVersion] = useState(0);
	const openRange = () => {
		setDraftStart(startDate);
		setDraftEnd(endDate);
		setResetMaximumDate(null);
		setSelectionPending(false);
		setOpen(true);
	};
	const draftMaximumDate =
		resetMaximumDate && resetMaximumDate > maximumDate
			? resetMaximumDate
			: maximumDate;
	useFocusEffect(useCallback(() => () => setOpen(false), []));
	return (
		<>
			{isCompact ? (
				<WorkspaceActions
					name="Reports"
					actions={[
						{
							label: "Date range",
							icon: "calendar-range",
							accessibilityLabel: `Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
							onPress: openRange,
						},
					]}
				/>
			) : Platform.OS === "web" ? (
				<Button
					mode="outlined"
					icon="calendar-range"
					accessibilityLabel={`Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`}
					contentStyle={{ minHeight: 48 }}
					onPress={openRange}
				>
					{startDate.toLocaleDateString("en-CA", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}{" "}
					–{" "}
					{endDate.toLocaleDateString("en-CA", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</Button>
			) : (
				<>
					<DateControl
						label="From"
						value={startDate}
						maximumDate={endDate}
						onChange={(date) => onApply(date, endDate)}
					/>
					<DateControl
						label="To"
						value={endDate}
						minimumDate={startDate}
						maximumDate={maximumDate}
						onChange={(date) => onApply(startDate, date)}
					/>
				</>
			)}
			<WorkspaceSheet
				visible={open}
				title="Date range"
				onClose={() => setOpen(false)}
				actions={
					<>
						<Button
							contentStyle={{ minHeight: 48 }}
							onPress={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							mode="contained"
							disabled={selectionPending}
							contentStyle={{ minHeight: 48 }}
							onPress={() => {
								onApply(draftStart, draftEnd);
								setOpen(false);
							}}
						>
							Apply range
						</Button>
					</>
				}
			>
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
					<Button
						mode="outlined"
						icon="calendar-range"
						contentStyle={{ minHeight: 48 }}
						style={{ alignSelf: "flex-start" }}
						accessibilityLabel="Payroll"
						accessibilityHint="Select the last completed half-month"
						onPress={() => {
							const period = getCompletedPayrollPeriod(new Date());
							setDraftStart(period.start);
							setDraftEnd(period.end);
							setSelectionPending(false);
							setSelectionVersion((version) => version + 1);
						}}
					>
						Payroll
					</Button>
					<Button
						mode="outlined"
						icon="restore"
						contentStyle={{ minHeight: 48 }}
						accessibilityLabel="Reset"
						accessibilityHint="Set both dates to today"
						onPress={() => {
							const today = new Date();
							today.setHours(12, 0, 0, 0);
							setDraftStart(today);
							setDraftEnd(new Date(today));
							setSelectionPending(false);
							setSelectionVersion((version) => version + 1);
							// The screen's date ceiling can be stale if the modal stayed open overnight.
							const endOfToday = new Date(today);
							endOfToday.setHours(23, 59, 59, 999);
							setResetMaximumDate(endOfToday);
						}}
					>
						Reset
					</Button>
				</View>
				<DateRangeControl
					key={selectionVersion}
					startDate={draftStart}
					endDate={draftEnd}
					maximumDate={draftMaximumDate}
					onPendingChange={setSelectionPending}
					onChange={(start, end) => {
						setDraftStart(start);
						setDraftEnd(end);
					}}
				/>
			</WorkspaceSheet>
		</>
	);
}
