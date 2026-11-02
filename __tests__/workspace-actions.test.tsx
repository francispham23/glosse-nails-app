import { expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useIsFocused } from "expo-router";
import { Platform } from "react-native";
import { Portal } from "react-native-paper";
import { WorkspaceActions } from "@/components/workspace/actions";
import {
	getWorkspaceLayout,
	useWorkspaceLayout,
} from "@/hooks/use-workspace-layout";

jest.mock("expo-router", () => ({
	useFocusEffect: jest.fn(),
	useIsFocused: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	...jest.requireActual<typeof import("@/hooks/use-workspace-layout")>(
		"@/hooks/use-workspace-layout",
	),
	useWorkspaceLayout: jest.fn(),
}));

test("the real Paper speed dial hides actions, reveals them, and selects once", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	jest.mocked(useIsFocused).mockReturnValue(true);
	const chooseDate = jest.fn();
	const editShift = jest.fn();
	await render(
		<Portal.Host>
			<WorkspaceActions
				name="Earnings"
				actions={[
					{ label: "Choose date", icon: "calendar", onPress: chooseDate },
					{ label: "Edit shift", icon: "plus", onPress: editShift },
				]}
			/>
		</Portal.Host>,
	);
	expect(screen.queryByRole("button", { name: "Edit shift" })).toBeNull();
	await fireEvent.press(
		screen.getByRole("button", { name: "Open Earnings actions" }),
	);
	await fireEvent.press(
		screen.getByText("Edit shift", { includeHiddenElements: true }),
	);
	expect(editShift).toHaveBeenCalledTimes(1);
	expect(chooseDate).not.toHaveBeenCalled();
	expect(
		screen.getByRole("button", { name: "Open Earnings actions" }),
	).toBeTruthy();
	expect(screen.queryByRole("button", { name: "Edit shift" })).toBeNull();
});

test("a single action is direct and inactive/wide screens expose no mobile controls", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	jest.mocked(useIsFocused).mockReturnValue(true);
	const onPress = jest.fn();
	const action = [{ label: "Choose date", icon: "calendar", onPress }];
	const view = await render(
		<Portal.Host>
			<WorkspaceActions name="Transactions" actions={action} />
		</Portal.Host>,
	);
	await fireEvent.press(screen.getByRole("button", { name: "Choose date" }));
	expect(onPress).toHaveBeenCalledTimes(1);
	jest.mocked(useIsFocused).mockReturnValue(false);
	await view.rerender(
		<Portal.Host>
			<WorkspaceActions name="Transactions" actions={action} />
		</Portal.Host>,
	);
	expect(screen.queryByRole("button")).toBeNull();
	jest.mocked(useIsFocused).mockReturnValue(true);
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
	await view.rerender(
		<Portal.Host>
			<WorkspaceActions name="Transactions" actions={action} />
		</Portal.Host>,
	);
	expect(screen.queryByRole("button")).toBeNull();
});

test("selection shows direct Save and disables it during submission", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	jest.mocked(useIsFocused).mockReturnValue(true);
	const onSave = jest.fn();
	const date = { label: "Choose date", icon: "calendar", onPress: jest.fn() };
	const save = {
		label: "Save shift",
		icon: "check",
		direct: true,
		onPress: onSave,
	};
	const view = await render(
		<Portal.Host>
			<WorkspaceActions name="Earnings" actions={[date, save]} />
		</Portal.Host>,
	);
	expect(screen.queryByRole("button", { name: "Choose date" })).toBeNull();
	await fireEvent.press(screen.getByRole("button", { name: "Save shift" }));
	expect(onSave).toHaveBeenCalledTimes(1);
	await view.rerender(
		<Portal.Host>
			<WorkspaceActions
				name="Earnings"
				actions={[date, { ...save, disabled: true, loading: true }]}
			/>
		</Portal.Host>,
	);
	await fireEvent.press(screen.getByRole("button", { name: "Save shift" }));
	expect(onSave).toHaveBeenCalledTimes(1);
	expect(
		screen.getByRole("button", { name: "Save shift", disabled: true }),
	).toBeTruthy();
});

test("web speed dial never renders a button inside another button", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	jest.mocked(useIsFocused).mockReturnValue(true);
	const platform = jest.replaceProperty(Platform, "OS", "web");
	const priorDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
	const focus = jest.fn();
	const addEventListener = jest.fn();
	const removeEventListener = jest.fn();
	Object.defineProperty(globalThis, "document", {
		configurable: true,
		value: {
			activeElement: { focus },
			addEventListener,
			removeEventListener,
		},
	});
	const chooseDate = jest.fn();
	const editShift = jest.fn();
	try {
		const view = await render(
			<Portal.Host>
				<WorkspaceActions
					name="Earnings"
					actions={[
						{ label: "Choose date", icon: "calendar", onPress: chooseDate },
						{ label: "Edit shift", icon: "plus", onPress: editShift },
					]}
				/>
			</Portal.Host>,
		);
		const nested: string[] = [];
		function inspect(value: unknown, insideButton = false) {
			if (Array.isArray(value)) {
				value.forEach((child) => {
					inspect(child, insideButton);
				});
			} else if (value && typeof value === "object") {
				const node = value as {
					props?: { accessibilityRole?: string; accessibilityLabel?: string };
					children?: unknown;
				};
				const button = node.props?.accessibilityRole === "button";
				if (button && insideButton)
					nested.push(node.props?.accessibilityLabel ?? "unlabeled");
				inspect(node.children, insideButton || button);
			}
		}
		inspect(view.toJSON());
		expect(nested).toEqual([]);
		await fireEvent.press(
			screen.getByRole("button", { name: "Open Earnings actions" }),
		);
		inspect(view.toJSON());
		expect(nested).toEqual([]);
		expect(screen.getAllByRole("button", { name: "Choose date" })).toHaveLength(
			1,
		);
		expect(screen.getAllByRole("button", { name: "Edit shift" })).toHaveLength(
			1,
		);
		await fireEvent.press(screen.getByRole("button", { name: "Edit shift" }));
		expect(editShift).toHaveBeenCalledTimes(1);
		expect(chooseDate).not.toHaveBeenCalled();
		expect(screen.queryByRole("button", { name: "Edit shift" })).toBeNull();
		expect(focus).toHaveBeenCalledTimes(1);
		await fireEvent.press(
			screen.getByRole("button", { name: "Open Earnings actions" }),
		);
		await fireEvent.press(
			screen.getByTestId("workspace-actions-backdrop", {
				includeHiddenElements: true,
			}),
		);
		expect(screen.queryByRole("button", { name: "Edit shift" })).toBeNull();
		expect(focus).toHaveBeenCalledTimes(2);
		await fireEvent.press(
			screen.getByRole("button", { name: "Open Earnings actions" }),
		);
		const keyDown = addEventListener.mock.calls.at(-1)?.[1] as (event: {
			key: string;
			preventDefault: () => void;
		}) => void;
		const preventDefault = jest.fn();
		await act(() => keyDown({ key: "Escape", preventDefault }));
		expect(preventDefault).toHaveBeenCalledTimes(1);
		expect(focus).toHaveBeenCalledTimes(3);
		expect(screen.queryByRole("button", { name: "Edit shift" })).toBeNull();
		await fireEvent.press(
			screen.getByRole("button", { name: "Open Earnings actions" }),
		);
		jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(1440));
		await view.rerender(
			<Portal.Host>
				<WorkspaceActions
					name="Earnings"
					actions={[
						{ label: "Choose date", icon: "calendar", onPress: chooseDate },
						{ label: "Edit shift", icon: "plus", onPress: editShift },
					]}
				/>
			</Portal.Host>,
		);
		expect(screen.queryByRole("button")).toBeNull();
		await view.unmount();
	} finally {
		platform.restore();
		if (priorDocument)
			Object.defineProperty(globalThis, "document", priorDocument);
		else Reflect.deleteProperty(globalThis, "document");
	}
});
