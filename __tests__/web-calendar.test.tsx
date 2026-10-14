/** @jest-environment jsdom */

import { CalendarDate } from "@internationalized/date";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	calendarDate,
	calendarValue,
} from "@/components/workspace/calendar.web";
import { DateControl } from "@/components/workspace/date-control.web";
import { DateRangeControl } from "@/components/workspace/date-range-control.web";
import { dateInputValue } from "@/components/workspace/date-value";
import { WorkspaceSheet } from "@/components/workspace/sheet.web";

// Calendar, DOM dialog, local dates and event handlers are real; only app theme/layout are substituted.
jest.mock("react-native-paper", () => ({
	useTheme: () => ({
		colors: {
			primary: "#5b4fe0",
			onPrimary: "#fff",
			primaryContainer: "#e8e3ff",
			onPrimaryContainer: "#261b68",
			surface: "#fff",
			surfaceVariant: "#eef0f6",
			onSurface: "#202331",
			onSurfaceVariant: "#596174",
			outlineVariant: "#dfe2eb",
		},
	}),
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	useWorkspaceLayout: () => ({ isCompact: true }),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
	Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
	container = document.createElement("div");
	document.body.append(container);
	root = createRoot(container);
});
afterEach(async () => {
	await act(async () => root.unmount());
	container.remove();
});
async function mount(node: ReactNode) {
	await act(async () => root.render(node));
}
function button(name: string) {
	const found = Array.from(
		document.querySelectorAll<HTMLElement>("button, [role=button]"),
	).find(
		(element) =>
			element.getAttribute("aria-label") === name ||
			element.textContent === name,
	);
	if (!found) throw new Error(`Missing button ${name}`);
	return found;
}
function day(day: number) {
	const found = Array.from(
		document.querySelectorAll<HTMLElement>("[role=button]"),
	).find(
		(element) =>
			element.textContent === String(day) &&
			element.getAttribute("aria-label")?.includes("October"),
	);
	if (!found) throw new Error(`Missing October ${day}`);
	return found;
}
async function click(element: HTMLElement) {
	await act(async () => element.click());
}

test("calendar conversion preserves local days across DST, leap day and year boundaries", () => {
	for (const [year, month, day] of [
		[2026, 3, 8],
		[2026, 11, 1],
		[2024, 2, 29],
		[2027, 1, 1],
	]) {
		const local = new Date(year, month - 1, day, 23, 59);
		const roundTrip = calendarDate(calendarValue(local));
		expect(roundTrip?.getFullYear()).toBe(year);
		expect(roundTrip?.getMonth()).toBe(month - 1);
		expect(roundTrip?.getDate()).toBe(day);
		expect(roundTrip?.getHours()).toBe(12);
	}
	expect(
		calendarDate(
			new CalendarDate(2026, 10, 6),
			undefined,
			new Date(2026, 9, 5, 23, 59),
		),
	).toBeNull();
	expect(
		calendarDate(new CalendarDate(2026, 10, 4), new Date(2026, 9, 5)),
	).toBeNull();
});

test("single-date calendar selects an actual day and prevents future dates", async () => {
	const onChange = jest.fn<(value: Date) => void>();
	await mount(
		<DateControl
			label="Overview date"
			value={new Date(2026, 9, 5)}
			maximumDate={new Date(2026, 9, 5, 23, 59)}
			onChange={onChange}
		/>,
	);
	expect(document.querySelector("input[type=date]")).toBeNull();
	await click(day(3));
	expect(onChange).toHaveBeenCalledTimes(1);
	expect(dateInputValue(onChange.mock.calls[0][0])).toBe("2026-10-03");
	await click(day(6));
	expect(onChange).toHaveBeenCalledTimes(1);
});

test("range calendar waits for both endpoints and orders backwards selection", async () => {
	const onChange = jest.fn<(start: Date, end: Date) => void>();
	const onPendingChange = jest.fn<(pending: boolean) => void>();
	await mount(
		<DateRangeControl
			startDate={new Date(2026, 9, 1)}
			endDate={new Date(2026, 9, 2)}
			maximumDate={new Date(2026, 9, 5, 23, 59)}
			onChange={onChange}
			onPendingChange={onPendingChange}
		/>,
	);
	await click(day(4));
	expect(onChange).not.toHaveBeenCalled();
	expect(onPendingChange).toHaveBeenLastCalledWith(true);
	expect(document.body.textContent).toContain("Choose end date");
	await click(day(2));
	expect(onChange).toHaveBeenCalledTimes(1);
	expect(onPendingChange).toHaveBeenLastCalledWith(false);
	expect(onChange.mock.calls[0].map(dateInputValue)).toEqual([
		"2026-10-02",
		"2026-10-04",
	]);
});

test("month navigation and month/year jumps preserve the selected date", async () => {
	const onChange = jest.fn<(value: Date) => void>();
	await mount(
		<DateControl
			label="Overview date"
			value={new Date(2026, 9, 5)}
			maximumDate={new Date(2026, 9, 5, 23, 59)}
			onChange={onChange}
		/>,
	);
	await click(button("Previous month"));
	expect(
		(document.querySelector('[aria-label="Month"]') as HTMLSelectElement).value,
	).toBe("9");
	const month = document.querySelector(
		'[aria-label="Month"]',
	) as HTMLSelectElement;
	await act(async () => {
		month.value = "2";
		month.dispatchEvent(new Event("change", { bubbles: true }));
	});
	expect(month.value).toBe("2");
	const year = document.querySelector(
		'[aria-label="Year"]',
	) as HTMLInputElement;
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(year, "2024");
		year.dispatchEvent(new Event("input", { bubbles: true }));
	});
	expect(year.value).toBe("2024");
	expect(
		document.querySelector('[aria-label*="February 29, 2024"]'),
	).not.toBeNull();
	expect(onChange).not.toHaveBeenCalled();
	for (const partial of ["2", "20", "202"]) {
		await act(async () => {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set?.call(year, partial);
			year.dispatchEvent(new Event("input", { bubbles: true }));
		});
		expect(
			(document.querySelector('[aria-label="Month"]') as HTMLSelectElement)
				.value,
		).toBe("2");
		expect(
			document.querySelector('[aria-label*="February 29, 2024"]'),
		).not.toBeNull();
	}
	await act(async () => {
		year.focus();
		year.blur();
	});
	expect(year.value).toBe("2024");
	expect(onChange).not.toHaveBeenCalled();
});

test("same-day range is valid and future endpoints cannot complete a range", async () => {
	const onChange = jest.fn<(start: Date, end: Date) => void>();
	await mount(
		<DateRangeControl
			startDate={new Date(2026, 9, 1)}
			endDate={new Date(2026, 9, 2)}
			maximumDate={new Date(2026, 9, 5, 23, 59)}
			onChange={onChange}
		/>,
	);
	await click(day(3));
	await click(day(6));
	expect(onChange).not.toHaveBeenCalled();
	await click(day(3));
	expect(onChange.mock.calls[0].map(dateInputValue)).toEqual([
		"2026-10-03",
		"2026-10-03",
	]);
});

test("web dialog labels itself, closes on Escape, and returns focus to its trigger", async () => {
	function Fixture() {
		const [open, setOpen] = useState(false);
		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Date range
				</button>
				<WorkspaceSheet
					visible={open}
					title="Date range"
					onClose={() => setOpen(false)}
					actions={
						<button type="button" onClick={() => setOpen(false)}>
							Cancel
						</button>
					}
				>
					<DateControl
						label="Overview date"
						value={new Date(2026, 9, 5)}
						onChange={() => {}}
					/>
				</WorkspaceSheet>
			</>
		);
	}
	await mount(<Fixture />);
	const trigger = button("Date range");
	trigger.focus();
	await click(trigger);
	expect(document.querySelector('[role="dialog"]')).not.toBeNull();
	expect(
		document.querySelector('[role="dialog"]')?.getAttribute("aria-labelledby"),
	).toBeTruthy();
	await act(async () =>
		document.activeElement?.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		),
	);
	expect(document.querySelector('[role="dialog"]')).toBeNull();
	await act(async () => new Promise((resolve) => setTimeout(resolve, 30)));
	expect(document.activeElement).toBe(trigger);
});
