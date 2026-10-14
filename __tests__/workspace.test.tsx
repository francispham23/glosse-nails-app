import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Platform } from "react-native";
import { AddButton } from "@/components/Buttons/add-button";
import { ListEmptyComponent } from "@/components/list-empty";
import { OverviewCard } from "@/components/workspace/card";
import {
	dateInputValue,
	parseDateInput,
} from "@/components/workspace/date-value";
import {
	WORKSPACE_TABS,
	WorkspaceNavigation,
} from "@/components/workspace/navigation";
import {
	getWorkspaceLayout,
	useWorkspaceLayout,
} from "@/hooks/use-workspace-layout";

jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/components/workspace/screen", () => ({
	workspaceStyles: {},
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	...jest.requireActual<typeof import("@/hooks/use-workspace-layout")>(
		"@/hooks/use-workspace-layout",
	),
	useWorkspaceLayout: jest.fn(),
}));

test("date input preserves the calendar day locally and rejects invalid/out-of-range dates", () => {
	const selected = parseDateInput("2026-03-08");
	expect(selected).not.toBeNull();
	expect(selected?.getFullYear()).toBe(2026);
	expect(selected?.getMonth()).toBe(2);
	expect(selected?.getDate()).toBe(8);
	if (!selected) {
		throw new Error("Expected a valid date from parseDateInput");
	}
	expect(dateInputValue(selected)).toBe("2026-03-08");
	expect(parseDateInput("2026-02-29")).toBeNull();
	expect(parseDateInput("")).toBeNull();
	expect(
		parseDateInput("2026-03-09", undefined, new Date(2026, 2, 8, 23)),
	).toBeNull();
	expect(parseDateInput("2026-03-07", new Date(2026, 2, 8))).toBeNull();
	expect(parseDateInput("2024-02-29")).not.toBeNull();
});

test("navigation adapts to available width and font scaling", () => {
	expect(getWorkspaceLayout(390).mode).toBe("compact");
	expect(getWorkspaceLayout(768).mode).toBe("rail");
	expect(getWorkspaceLayout(1440).mode).toBe("sidebar");
	expect(getWorkspaceLayout(768, 2).mode).toBe("compact");
});

test("the same destinations remain selected across layout changes and honour prevented tab presses", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	const emit = jest
		.fn<() => { defaultPrevented: boolean }>()
		.mockReturnValue({ defaultPrevented: false });
	const navigate = jest.fn();
	const props = {
		state: {
			index: 0,
			routes: WORKSPACE_TABS.map((tab) => ({ key: tab.name, name: tab.name })),
		},
		navigation: { emit, navigate },
	} as unknown as ComponentProps<typeof WorkspaceNavigation>;
	const view = await render(<WorkspaceNavigation {...props} />);
	expect(
		screen.getByRole("tab", { name: "Earnings", selected: true }),
	).toBeTruthy();
	await fireEvent.press(screen.getByRole("tab", { name: "Transactions" }));
	expect(navigate).toHaveBeenCalledWith("transactions", undefined);
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
	await view.rerender(<WorkspaceNavigation {...props} />);
	expect(
		screen.getByRole("tab", { name: "Earnings", selected: true }),
	).toBeTruthy();
	expect(screen.getAllByRole("tab")).toHaveLength(4);
	emit.mockReturnValue({ defaultPrevented: true });
	await fireEvent.press(screen.getByRole("tab", { name: "Gift Cards" }));
	expect(navigate).toHaveBeenCalledTimes(1);
});

test("empty results are immediate and loading follows the query state", async () => {
	const view = await render(<ListEmptyComponent item="transaction" loading />);
	expect(screen.getByText("Loading…")).toBeTruthy();
	expect(screen.queryByText("No transactions to display")).toBeNull();
	await view.rerender(
		<ListEmptyComponent item="transaction" loading={false} />,
	);
	expect(screen.queryByText("Loading…")).toBeNull();
	expect(screen.getByText("No transactions to display")).toBeTruthy();
});

test("labeled overview actions invoke their direct press handler", async () => {
	const onPress = jest.fn();
	await render(<AddButton label="Create gift card" onPress={onPress} />);
	await fireEvent.press(
		screen.getByRole("button", { name: "Create gift card" }),
	);
	expect(onPress).toHaveBeenCalledTimes(1);
});

test("web shift checkboxes activate with Space once and respect disabled state", async () => {
	const platform = jest.replaceProperty(Platform, "OS", "web");
	const onPress = jest.fn();
	const preventDefault = jest.fn();
	try {
		const view = await render(
			<OverviewCard selecting label="Select technician" onPress={onPress} />,
		);
		const event = { key: " ", preventDefault };
		await fireEvent(screen.getByRole("checkbox"), "keyDown", event);
		expect(onPress).toHaveBeenCalledTimes(1);
		expect(preventDefault).toHaveBeenCalledTimes(1);
		await fireEvent(screen.getByRole("checkbox"), "keyDown", {
			...event,
			repeat: true,
		});
		expect(onPress).toHaveBeenCalledTimes(1);
		await view.rerender(
			<OverviewCard
				selecting
				disabled
				label="Select technician"
				onPress={onPress}
			/>,
		);
		await fireEvent(screen.getByRole("checkbox"), "keyDown", event);
		expect(onPress).toHaveBeenCalledTimes(1);
	} finally {
		platform.restore();
	}
});
