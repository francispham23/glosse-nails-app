import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useMutation, useQuery } from "convex/react";
import HomeRoute from "@/app/(root)/(main)/(tabs)/earnings";
import { api } from "@/convex/_generated/api";

jest.mock("convex/react", () => ({
	useQuery: jest.fn(),
	useMutation: jest.fn(),
}));
jest.mock("@/convex/_generated/api", () => ({
	api: {
		users: { usersByDateRange: "usersByDateRange" },
		shifts: { getShiftByDate: "getShiftByDate", saveShift: "saveShift" },
	},
}));
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({
		startOfDay: new Date("2026-09-29T00:00:00Z"),
		endOfDay: new Date("2026-09-29T23:59:59Z"),
	}),
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/hooks/use-authorization", () => ({
	useAuthorization: () => ({
		isAuthorized: true,
		user: { _id: "manager" },
	}),
}));
jest.mock("@/utils", () => ({
	cn: (...parts: unknown[]) => parts.filter(Boolean).join(" "),
	getErrorMessage: (_error: unknown, fallback: string) => fallback,
	isToday: () => true,
}));
jest.mock("react-native-reanimated", () => {
	const { FlatList, View } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		__esModule: true,
		default: { FlatList, View },
		FadeIn: {},
		FadeOut: {},
		LinearTransition: {},
	};
});
jest.mock("@/components/Buttons/add-button", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Pressable, Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		AddButton: ({
			isAdding,
			setIsAdding,
		}: {
			isAdding: boolean;
			setIsAdding: (adding: boolean) => void;
		}) =>
			React.createElement(
				Pressable,
				{
					testID: "shift-toggle",
					onPress: () => setIsAdding(!isAdding),
				},
				React.createElement(Text, null, isAdding ? "Save shift" : "Edit shift"),
			),
	};
});
jest.mock("@/components/Cards/technician-card", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Pressable, Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		TechnicianCard: ({
			item,
			isSelected,
			onToggleSelect,
		}: {
			item: { _id: string; name: string };
			isSelected: boolean;
			onToggleSelect: (item: { _id: string; name: string }) => void;
		}) =>
			React.createElement(
				Pressable,
				{
					testID: `tech-${item._id}`,
					onPress: () => onToggleSelect(item),
				},
				React.createElement(
					Text,
					null,
					`${item.name}: ${isSelected ? "selected" : "not selected"}`,
				),
			),
	};
});
jest.mock("@/components/list-empty", () => ({
	ListEmptyComponent: () => null,
}));

test("shift draft survives a live query refresh and saves the selected IDs", async () => {
	const first = { _id: "first", name: "First", compensation: 10, tip: 2 };
	const second = { _id: "second", name: "Second", compensation: 10, tip: 2 };
	let liveShift = [first];
	const saveShift = jest.fn<() => Promise<string>>().mockResolvedValue("shift");
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.users.usersByDateRange)
			return [first, second] as never;
		if (reference === api.shifts.getShiftByDate) return liveShift as never;
		return undefined as never;
	});
	jest.mocked(useMutation).mockReturnValue(saveShift as never);

	const view = await render(<HomeRoute />);
	await fireEvent.press(screen.getByTestId("shift-toggle"));
	await fireEvent.press(screen.getByTestId("tech-second"));
	expect(screen.getByText("Second: selected")).toBeTruthy();

	liveShift = [second];
	await view.rerender(<HomeRoute />);
	expect(screen.getByText("First: selected")).toBeTruthy();
	expect(screen.getByText("Second: selected")).toBeTruthy();

	await fireEvent.press(screen.getByTestId("shift-toggle"));
	expect(saveShift).toHaveBeenCalledWith({
		shiftDate: Date.parse("2026-09-29T00:00:00Z"),
		technicians: ["first", "second"],
	});
});
