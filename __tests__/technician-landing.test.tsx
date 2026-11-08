import { beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import HomeRoute from "@/app/(root)/(main)/(tabs)/earnings";
import { api } from "@/convex/_generated/api";

jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({ navigate: jest.fn() })),
	useFocusEffect: jest.fn(),
	useIsFocused: () => true,
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	useWorkspaceLayout: () => ({ isCompact: false, isWide: true }),
}));
jest.mock("convex/react", () => ({
	useQuery: jest.fn(),
	useMutation: jest.fn(),
}));
jest.mock("@/convex/_generated/api", () => ({
	api: {
		users: {
			usersByDateRange: "usersByDateRange",
			getUserById: "getUserById",
			viewerAccess: "viewerAccess",
		},
		shifts: { getShiftByDate: "getShiftByDate", saveShift: "saveShift" },
	},
}));
let mockNow = Date.parse("2026-09-29T19:00:00Z");
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({
		startOfDay: new Date("2026-09-29T00:00:00Z"),
		endOfDay: new Date("2026-09-30T06:59:59Z"),
		now: mockNow,
	}),
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/utils", () => ({
	cn: (...parts: unknown[]) => parts.filter(Boolean).join(" "),
	getErrorMessage: (_error: unknown, fallback: string) => fallback,
	isToday: jest.fn(),
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

jest.mock("expo-haptics", () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: { Light: "light" },
}));
jest.mock("@/components/list-empty", () => ({
	ListEmptyComponent: () => null,
}));

const navigate = jest.fn();
beforeEach(() => {
	mockNow = Date.parse("2026-09-29T19:00:00Z");
	jest.mocked(useRouter).mockReturnValue({ navigate } as never);
	navigate.mockClear();
});

function fixture(role: "technician" | "manager" = "technician") {
	const own = {
		_id: "first",
		_creationTime: 0,
		name: "First",
		compensation: 10,
		tip: 2,
	};
	const second = {
		_id: "second",
		_creationTime: 0,
		name: "Second",
		compensation: 125,
		tip: 15,
	};
	const zero = {
		_id: "zero",
		_creationTime: 0,
		name: "Zero",
		compensation: 0,
		tip: 0,
	};
	let ready = false;
	let shift = [own, second, zero];
	jest.mocked(useQuery).mockImplementation((reference, ...args) => {
		if (args[0] === "skip") return undefined as never;
		if (reference === api.users.getUserById)
			throw new Error("Forbidden coworker profile lookup");
		if (!ready) return undefined as never;
		if (reference === api.users.viewerAccess)
			return {
				authenticated: true,
				isActive: true,
				isAuthorized: role === "manager",
				role,
				user: own,
			} as never;
		if (reference === api.users.usersByDateRange)
			return [zero, own, second] as never;
		if (reference === api.shifts.getShiftByDate) return shift as never;
		throw new Error("Unexpected query");
	});
	jest.mocked(useMutation).mockReturnValue(jest.fn() as never);
	return {
		load: () => {
			ready = true;
		},
		offShift: () => {
			shift = [second, zero];
		},
	};
}

test("technician bootstrap reaches real Earnings cards without any private profile request", async () => {
	const f = fixture();
	const view = await render(<HomeRoute />);
	expect(screen.queryByText("Second")).toBeNull();
	f.load();
	await view.rerender(<HomeRoute />);
	expect(screen.getByText("Second")).toBeTruthy();
	expect(screen.getByText("$125")).toBeTruthy();
	expect(screen.getByText("$15")).toBeTruthy();
	expect(screen.getAllByText("$0")).toHaveLength(2);
	await fireEvent.press(screen.getByLabelText("Add earning for Second"));
	expect(navigate).not.toHaveBeenCalled();
	await fireEvent.press(screen.getByLabelText("Add earning for First"));
	expect(navigate).toHaveBeenCalledWith("/technician/first/create");
});

test("real technician landing retains off-shift and historical visibility", async () => {
	const f = fixture();
	f.load();
	const view = await render(<HomeRoute />);
	mockNow = Date.parse("2026-09-30T05:00:00Z");
	await view.rerender(<HomeRoute />);
	expect(screen.queryByText("Second")).toBeNull();
	expect(screen.getByLabelText("Add earning for First")).toBeDisabled();
	mockNow = Date.parse("2026-09-29T19:00:00Z");
	f.offShift();
	await view.rerender(<HomeRoute />);
	expect(screen.queryByText("Second")).toBeNull();
});

test("manager landing retains team entry with the same real cards", async () => {
	const f = fixture("manager");
	f.load();
	await render(<HomeRoute />);
	expect(screen.getByText("$125")).toBeTruthy();
	await fireEvent.press(screen.getByLabelText("Add earning for Second"));
	expect(navigate).toHaveBeenCalledWith("/technician/second/create");
});
