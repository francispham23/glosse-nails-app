/** @jest-environment jsdom */
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SellDatePicker } from "@/components/Form/sell-date-picker.web";
import { ServiceTimePicker } from "@/components/TransactionForm/service-time-picker.web";

jest.mock("react-native-paper", () => {
	return {
		useTheme: () => ({
			colors: {
				primary: "purple",
				onSurface: "black",
				onSurfaceVariant: "gray",
				surface: "white",
				outline: "gray",
				outlineVariant: "gray",
				surfaceVariant: "white",
			},
		}),
	};
});

function requireElement<E extends Element>(
	parent: ParentNode,
	selector: string,
): E {
	const element = parent.querySelector<E>(selector);
	if (!element) {
		throw new Error(`Expected element matching "${selector}"`);
	}
	return element;
}

function requireValue<T>(value: T | null | undefined, message: string): T {
	if (value == null) {
		throw new Error(message);
	}
	return value;
}

let root: Root;
let container: HTMLDivElement;

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

function TimeFixture() {
	const [open, setOpen] = useState(false);
	return (
		<ServiceTimePicker
			serviceDate={new Date(2026, 9, 12, 13, 30).getTime()}
			open={open}
			setOpen={setOpen}
			endOfDay={new Date(2026, 9, 13, 23, 59)}
			mutedColor="gray"
			onDateChange={jest.fn()}
		/>
	);
}

test("clicking gift date opens a real calendar", async () => {
	await act(async () =>
		root.render(
			<SellDatePicker
				date={new Date(2026, 9, 12, 13, 30)}
				maximumDate={new Date(2026, 9, 13, 23, 59)}
				mutedColor="gray"
				onChange={jest.fn()}
			/>,
		),
	);
	const trigger = requireElement<HTMLElement>(container, "button, input");
	await act(async () => trigger.click());
	expect(container.querySelector('[role="grid"]')).not.toBeNull();
});

test("clicking service time opens the real time editor", async () => {
	await act(async () => root.render(<TimeFixture />));
	await act(async () =>
		requireElement<HTMLElement>(container, "button, input").click(),
	);
	expect(container.querySelector('[aria-label="Service time"]')).not.toBeNull();
});

test("date selection preserves clock fields, future days are disabled, and focus returns", async () => {
	const change = jest.fn();
	await act(async () =>
		root.render(
			<SellDatePicker
				date={new Date(2026, 9, 12, 13, 30)}
				maximumDate={new Date(2026, 9, 13, 23, 59)}
				mutedColor="gray"
				onChange={change}
			/>,
		),
	);
	const trigger = requireElement<HTMLButtonElement>(container, "button");
	await act(async () => trigger.click());
	const days = Array.from(
		container.querySelectorAll<HTMLElement>("[role=button]"),
	);
	const day = requireValue(
		days.find(
			(node) =>
				node.textContent === "10" &&
				node.getAttribute("aria-label")?.includes("October"),
		),
		"Expected October 10 day",
	);
	const future = requireValue(
		days.find(
			(node) =>
				node.textContent === "14" &&
				node.getAttribute("aria-label")?.includes("October"),
		),
		"Expected October 14 day",
	);
	expect(future.getAttribute("aria-disabled")).toBe("true");
	await act(async () => future.click());
	expect(change).not.toHaveBeenCalled();
	await act(async () => day.click());
	expect(change).toHaveBeenCalledWith(new Date(2026, 9, 10, 13, 30));
	expect(container.querySelector("[role=grid]")).toBeNull();
	expect(document.activeElement).toBe(trigger);
});

test("keyboard opens picker and Escape closes it without escaping to the parent modal", async () => {
	await act(async () => root.render(<TimeFixture />));
	const trigger = requireElement<HTMLButtonElement>(container, "button");
	await act(async () => {
		trigger.focus();
		trigger.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				code: "Enter",
				bubbles: true,
			}),
		);
		trigger.dispatchEvent(
			new KeyboardEvent("keyup", {
				key: "Enter",
				code: "Enter",
				bubbles: true,
			}),
		);
	});
	expect(trigger.getAttribute("aria-expanded")).toBe("true");
	const parentEscape = jest.fn();
	window.addEventListener("keydown", parentEscape);
	try {
		await act(async () =>
			requireElement<HTMLElement>(container, "[role=spinbutton]").dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			),
		);
		expect(parentEscape).not.toHaveBeenCalled();
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(trigger);
	} finally {
		window.removeEventListener("keydown", parentEscape);
	}
});

test("editing time keeps the service day and Done returns focus", async () => {
	const change = jest.fn();
	function Fixture() {
		const [open, setOpen] = useState(false);
		return (
			<ServiceTimePicker
				serviceDate={new Date(2026, 9, 12, 13, 30).getTime()}
				open={open}
				setOpen={setOpen}
				endOfDay={new Date(2026, 9, 12, 23, 59, 59)}
				mutedColor="gray"
				onDateChange={change}
			/>
		);
	}
	await act(async () => root.render(<Fixture />));
	const trigger = requireElement<HTMLButtonElement>(container, "button");
	await act(async () => trigger.click());
	const hour = requireElement<HTMLElement>(container, "[role=spinbutton]");
	await act(async () =>
		hour.dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
		),
	);
	expect(change).toHaveBeenCalledWith(undefined, new Date(2026, 9, 12, 14, 30));
	const done = requireValue(
		Array.from(container.querySelectorAll("button")).find(
			(node) => node.textContent === "Done",
		),
		"Expected Done button",
	);
	await act(async () => done.click());
	expect(document.activeElement).toBe(trigger);
});

test("time edits past the existing cutoff are rejected", async () => {
	const change = jest.fn();
	function Fixture() {
		const [open, setOpen] = useState(false);
		return (
			<ServiceTimePicker
				serviceDate={new Date(2026, 9, 12, 13, 30).getTime()}
				open={open}
				setOpen={setOpen}
				endOfDay={new Date(2026, 9, 12, 13, 30)}
				mutedColor="gray"
				onDateChange={change}
			/>
		);
	}
	await act(async () => root.render(<Fixture />));
	await act(async () =>
		requireElement<HTMLButtonElement>(container, "button").click(),
	);
	await act(async () =>
		requireElement<HTMLElement>(container, "[role=spinbutton]").dispatchEvent(
			new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
		),
	);
	expect(change).not.toHaveBeenCalled();
});
