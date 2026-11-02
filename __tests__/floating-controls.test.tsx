import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import { dateInputValue } from "@/components/workspace/date-value";
import { ReportDateControls } from "@/components/workspace/report-date-controls";
import {
	getWorkspaceLayout,
	useWorkspaceLayout,
} from "@/hooks/use-workspace-layout";

jest.mock("react-native-safe-area-context", () => ({
	SafeAreaInsetsContext: jest
		.requireActual<typeof import("react")>("react")
		.createContext({ top: 0, bottom: 34, left: 0, right: 0 }),
	useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
	useFocusEffect: jest.fn(),
	useIsFocused: () => true,
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	...jest.requireActual<typeof import("@/hooks/use-workspace-layout")>(
		"@/hooks/use-workspace-layout",
	),
	useWorkspaceLayout: jest.fn(),
}));
// Substitute only the platform date picker; exercise the range draft/sheet flow.
jest.mock("@/components/workspace/date-control", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Pressable, Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	const { dateInputValue } = jest.requireActual<
		typeof import("@/components/workspace/date-value")
	>("@/components/workspace/date-value");
	return {
		DateControl: ({
			label,
			value,
			maximumDate,
			onChange,
		}: {
			label: string;
			value: Date;
			maximumDate?: Date;
			onChange: (value: Date) => void;
		}) =>
			React.createElement(
				Pressable,
				{
					accessibilityRole: "button",
					accessibilityLabel: label,
					accessibilityValue: {
						text: maximumDate ? dateInputValue(maximumDate) : undefined,
					},
					onPress: () => onChange(new Date(2026, 9, 3)),
				},
				React.createElement(Text, null, `${label}: ${dateInputValue(value)}`),
			),
	};
});

const start = new Date(2026, 9, 4);
const end = new Date(2026, 9, 4, 23, 59);

test("mobile range changes are drafts until Apply and survive layout changes", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	const onApply = jest.fn();
	const props = { startDate: start, endDate: end, maximumDate: end, onApply };
	const view = await render(
		<PaperProvider>
			<ReportDateControls {...props} />
		</PaperProvider>,
	);
	expect(screen.queryByRole("button", { name: "From" })).toBeNull();
	await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
	await fireEvent.press(screen.getByRole("button", { name: "From" }));
	expect(onApply).not.toHaveBeenCalled();
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
	await view.rerender(
		<PaperProvider>
			<ReportDateControls {...props} />
		</PaperProvider>,
	);
	expect(screen.getByText("From: 2026-10-03")).toBeTruthy();
	await fireEvent.press(screen.getByRole("button", { name: "Apply range" }));
	expect(onApply).toHaveBeenCalledTimes(1);
	expect(onApply).toHaveBeenCalledWith(new Date(2026, 9, 3), end);
});

test("Cancel and backdrop dismiss do not commit and reopening starts from committed dates", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	const onApply = jest.fn();
	await render(
		<PaperProvider>
			<ReportDateControls
				startDate={start}
				endDate={end}
				maximumDate={end}
				onApply={onApply}
			/>
		</PaperProvider>,
	);
	await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
	await fireEvent.press(screen.getByRole("button", { name: "From" }));
	await fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
	expect(onApply).not.toHaveBeenCalled();
	await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
	expect(screen.getByText("From: 2026-10-04")).toBeTruthy();
	await fireEvent.press(
		screen.getByRole("button", {
			name: "Close date picker",
			includeHiddenElements: true,
		}),
	);
	expect(onApply).not.toHaveBeenCalled();
	expect(screen.queryByRole("button", { name: "Apply range" })).toBeNull();
});

test("native desktop keeps direct inline range updates", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
	const onApply = jest.fn();
	await render(
		<PaperProvider>
			<ReportDateControls
				startDate={start}
				endDate={end}
				maximumDate={end}
				onApply={onApply}
			/>
		</PaperProvider>,
	);
	expect(screen.queryByRole("button", { name: /^Date range:/ })).toBeNull();
	await fireEvent.press(screen.getByRole("button", { name: "From" }));
	expect(onApply).toHaveBeenCalledWith(new Date(2026, 9, 3), end);
});

test("web desktop opens one range panel and retains draft/Apply semantics", async () => {
	const platform = jest.replaceProperty(Platform, "OS", "web");
	try {
		jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
		const onApply = jest.fn();
		await render(
			<PaperProvider>
				<ReportDateControls
					startDate={start}
					endDate={end}
					maximumDate={end}
					onApply={onApply}
				/>
			</PaperProvider>,
		);
		expect(screen.queryByRole("button", { name: "From" })).toBeNull();
		await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
		expect(screen.getByRole("button", { name: "Payroll" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
		await fireEvent.press(screen.getByRole("button", { name: "From" }));
		expect(onApply).not.toHaveBeenCalled();
		await fireEvent.press(screen.getByRole("button", { name: "Apply range" }));
		expect(onApply).toHaveBeenCalledTimes(1);
		expect(onApply).toHaveBeenCalledWith(new Date(2026, 9, 3), end);
	} finally {
		platform.restore();
	}
});

test("Payroll fills a completed period without applying until confirmation", async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(2026, 9, 5, 10));
	try {
		jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
		const onApply = jest.fn<(start: Date, end: Date) => void>();
		await render(
			<PaperProvider>
				<ReportDateControls
					startDate={start}
					endDate={end}
					maximumDate={new Date(2026, 9, 5, 23, 59)}
					onApply={onApply}
				/>
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
		await fireEvent.press(screen.getByRole("button", { name: "Payroll" }));
		expect(screen.getByText("From: 2026-09-16")).toBeTruthy();
		expect(screen.getByText("To: 2026-09-30")).toBeTruthy();
		expect(onApply).not.toHaveBeenCalled();
		await fireEvent.press(screen.getByRole("button", { name: "Apply range" }));
		expect(onApply).toHaveBeenCalledTimes(1);
		const [appliedStart, appliedEnd] = onApply.mock.calls[0];
		expect(dateInputValue(appliedStart)).toBe("2026-09-16");
		expect(dateInputValue(appliedEnd)).toBe("2026-09-30");
		expect(screen.queryByRole("button", { name: "Payroll" })).toBeNull();
	} finally {
		jest.useRealTimers();
	}
});

test.each(["Cancel", "Close date picker"])(
	"Payroll respects %s, resets on reopen and reads the clock again after a boundary",
	async (dismissLabel) => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 9, 15, 23, 59));
		try {
			jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
			const onApply = jest.fn<(start: Date, end: Date) => void>();
			const props = {
				startDate: start,
				endDate: end,
				maximumDate: new Date(2026, 9, 31, 23, 59),
				onApply,
			};
			const view = await render(
				<PaperProvider>
					<ReportDateControls {...props} />
				</PaperProvider>,
			);
			await fireEvent.press(
				screen.getByRole("button", { name: /^Date range:/ }),
			);
			await fireEvent.press(screen.getByRole("button", { name: "Payroll" }));
			expect(screen.getByText("To: 2026-09-30")).toBeTruthy();
			await fireEvent.press(
				screen.getByRole("button", {
					name: dismissLabel,
					includeHiddenElements: true,
				}),
			);
			expect(onApply).not.toHaveBeenCalled();
			await fireEvent.press(
				screen.getByRole("button", { name: /^Date range:/ }),
			);
			expect(screen.getByText("From: 2026-10-04")).toBeTruthy();
			jest.setSystemTime(new Date(2026, 9, 16, 0, 1));
			await fireEvent.press(screen.getByRole("button", { name: "Payroll" }));
			expect(screen.getByText("From: 2026-10-01")).toBeTruthy();
			expect(screen.getByText("To: 2026-10-15")).toBeTruthy();
			jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
			await view.rerender(
				<PaperProvider>
					<ReportDateControls {...props} />
				</PaperProvider>,
			);
			expect(screen.getByText("To: 2026-10-15")).toBeTruthy();
			// Manual edits remain possible after the preset and after resizing.
			await fireEvent.press(screen.getByText("From: 2026-10-01"));
			await fireEvent.press(
				screen.getByRole("button", { name: "Apply range" }),
			);
			expect(onApply).toHaveBeenCalledTimes(1);
			const [appliedStart, appliedEnd] = onApply.mock.calls[0];
			expect(dateInputValue(appliedStart)).toBe("2026-10-03");
			expect(dateInputValue(appliedEnd)).toBe("2026-10-15");
		} finally {
			jest.useRealTimers();
		}
	},
);

test("Reset uses today after Payroll, stays a draft and Apply commits once", async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(2026, 9, 5, 10));
	try {
		jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
		const onApply = jest.fn<(start: Date, end: Date) => void>();
		await render(
			<PaperProvider>
				<ReportDateControls
					startDate={new Date(2026, 7, 1)}
					endDate={new Date(2026, 7, 15)}
					maximumDate={new Date(2026, 9, 5, 23, 59)}
					onApply={onApply}
				/>
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
		await fireEvent.press(screen.getByRole("button", { name: "Payroll" }));
		expect(screen.getByText("From: 2026-09-16")).toBeTruthy();
		await fireEvent.press(screen.getByRole("button", { name: "Reset" }));
		expect(screen.getByText("From: 2026-10-05")).toBeTruthy();
		expect(screen.getByText("To: 2026-10-05")).toBeTruthy();
		expect(onApply).not.toHaveBeenCalled();
		await fireEvent.press(screen.getByRole("button", { name: "Apply range" }));
		expect(onApply).toHaveBeenCalledTimes(1);
		const [appliedStart, appliedEnd] = onApply.mock.calls[0];
		expect(dateInputValue(appliedStart)).toBe("2026-10-05");
		expect(dateInputValue(appliedEnd)).toBe("2026-10-05");
		expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
	} finally {
		jest.useRealTimers();
	}
});

test("Reset reads a new calendar day after midnight and keeps picker bounds compatible", async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date(2026, 11, 31, 23, 59));
	try {
		jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
		const onApply = jest.fn<(start: Date, end: Date) => void>();
		await render(
			<PaperProvider>
				<ReportDateControls
					startDate={start}
					endDate={end}
					maximumDate={new Date(2026, 11, 31, 23, 59, 59, 999)}
					onApply={onApply}
				/>
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByRole("button", { name: /^Date range:/ }));
		jest.setSystemTime(new Date(2027, 0, 1, 0, 1));
		await fireEvent.press(screen.getByRole("button", { name: "Reset" }));
		expect(screen.getByText("From: 2027-01-01")).toBeTruthy();
		expect(screen.getByText("To: 2027-01-01")).toBeTruthy();
		// The picker substitute exposes the date ceiling passed by the real range component.
		expect(screen.getByRole("button", { name: "To" })).toHaveAccessibilityValue(
			{
				text: "2027-01-01",
			},
		);
		expect(onApply).not.toHaveBeenCalled();
		await fireEvent.press(screen.getByRole("button", { name: "Payroll" }));
		expect(screen.getByText("From: 2026-12-16")).toBeTruthy();
		expect(screen.getByText("To: 2026-12-31")).toBeTruthy();
	} finally {
		jest.useRealTimers();
	}
});

test.each(["Cancel", "Close date picker"])(
	"Reset drafts survive resizing and %s discards them on reopening",
	async (dismissLabel) => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 9, 5, 10));
		try {
			jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
			const onApply = jest.fn();
			const props = {
				startDate: start,
				endDate: end,
				maximumDate: new Date(2026, 9, 5, 23, 59),
				onApply,
			};
			const view = await render(
				<PaperProvider>
					<ReportDateControls {...props} />
				</PaperProvider>,
			);
			await fireEvent.press(
				screen.getByRole("button", { name: /^Date range:/ }),
			);
			await fireEvent.press(screen.getByRole("button", { name: "Reset" }));
			jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
			await view.rerender(
				<PaperProvider>
					<ReportDateControls {...props} />
				</PaperProvider>,
			);
			expect(screen.getByText("From: 2026-10-05")).toBeTruthy();
			expect(screen.getByText("To: 2026-10-05")).toBeTruthy();
			await fireEvent.press(
				screen.getByRole("button", {
					name: dismissLabel,
					includeHiddenElements: true,
				}),
			);
			expect(onApply).not.toHaveBeenCalled();
			jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
			await view.rerender(
				<PaperProvider>
					<ReportDateControls {...props} />
				</PaperProvider>,
			);
			await fireEvent.press(
				screen.getByRole("button", { name: /^Date range:/ }),
			);
			expect(screen.getByText("From: 2026-10-04")).toBeTruthy();
			expect(screen.getByText("To: 2026-10-04")).toBeTruthy();
		} finally {
			jest.useRealTimers();
		}
	},
);
