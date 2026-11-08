import { beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import HomeRoute from "@/app/(root)/(main)/(tabs)/earnings";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";
import { isToday, type User } from "@/utils";

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
		users: { usersByDateRange: "usersByDateRange", getUserById: "getUserById" },
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
	useAuthorization: jest.fn(),
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
jest.mock("@/components/Cards/technician-card", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Pressable, Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		TechnicianCard: ({
			item,
			isSelected,
			isAuthorized,
			onToggleSelect,
		}: {
			item: { _id: string; name: string; compensation: number; tip: number };
			isSelected: boolean;
			isAuthorized: boolean;
			onToggleSelect: (item: { _id: string; name: string }) => void;
		}) =>
			React.createElement(
				Pressable,
				{
					testID: `tech-${item._id}`,
					disabled: !isAuthorized,
					onPress: () => onToggleSelect(item),
				},
				React.createElement(
					Text,
					null,
					`${item.name}: ${isSelected ? "selected" : "not selected"}`,
				),
				React.createElement(Text, null, `$${item.compensation}`),
				React.createElement(Text, null, `$${item.tip}`),
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

test("a rejected shift save keeps the selection and permits a retry", async () => {
	const first = { _id: "first", name: "First", compensation: 10, tip: 2 };
	const second = { _id: "second", name: "Second", compensation: 10, tip: 2 };
	const saveShift = jest
		.fn<() => Promise<string>>()
		.mockRejectedValueOnce(new Error("Rejected"))
		.mockResolvedValueOnce("shift");
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.users.usersByDateRange)
			return [first, second] as never;
		if (reference === api.shifts.getShiftByDate) return [first] as never;
		return undefined as never;
	});
	jest.mocked(useMutation).mockReturnValue(saveShift as never);
	await render(<HomeRoute />);
	await fireEvent.press(screen.getByTestId("shift-toggle"));
	await fireEvent.press(screen.getByTestId("tech-second"));
	await fireEvent.press(screen.getByTestId("shift-toggle"));
	expect(screen.getByText("Failed to save shift")).toBeTruthy();
	expect(screen.getByText("Second: selected")).toBeTruthy();
	expect(screen.getByText("Save shift")).toBeTruthy();
	await fireEvent.press(screen.getByTestId("shift-toggle"));
	expect(saveShift).toHaveBeenCalledTimes(2);
	expect(saveShift).toHaveBeenLastCalledWith({
		shiftDate: Date.parse("2026-09-29T00:00:00Z"),
		technicians: ["first", "second"],
	});
	expect(screen.queryByText("Failed to save shift")).toBeNull();
	expect(screen.getByText("Edit shift")).toBeTruthy();
});

jest.mock("expo-haptics", () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: { Light: "light" },
}));

beforeEach(() => {
	jest
		.mocked(useAuthorization)
		.mockReturnValue({ isAuthorized: true, user: { _id: "manager" } } as never);
	jest.mocked(isToday).mockReturnValue(true);
});

function teamFixture() {
	const own = { _id: "first", name: "First", compensation: 10, tip: 2 };
	const coworker = {
		_id: "second",
		name: "Second",
		compensation: 125,
		tip: 15,
	};
	const zero = { _id: "zero", name: "Zero", compensation: 0, tip: 0 };
	let shift: unknown = [own, coworker, zero];
	let totals = [own, coworker, zero];
	jest
		.mocked(useAuthorization)
		.mockReturnValue({ isAuthorized: false, user: { _id: "first" } } as never);
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.users.usersByDateRange) return totals as never;
		if (reference === api.shifts.getShiftByDate) return shift as never;
		throw new Error("Earnings must use the original queries only");
	});
	return {
		own,
		coworker,
		setShift: (value: unknown) => {
			shift = value;
		},
		setTotal: (compensation: number) => {
			totals = [own, { ...coworker, compensation }, zero];
		},
	};
}

test("original team summaries show coworker earnings, tips and real zero rows", async () => {
	const f = teamFixture();
	const view = await render(<HomeRoute />);
	expect(screen.getByText("$125")).toBeTruthy();
	expect(screen.getByText("$15")).toBeTruthy();
	expect(screen.getAllByText("$0")).toHaveLength(2);
	expect(screen.getByTestId("tech-second")).toBeDisabled();
	expect(screen.getByTestId("tech-first")).toBeEnabled();
	f.setTotal(150);
	await view.rerender(<HomeRoute />);
	expect(screen.getByText("$150")).toBeTruthy();
	f.setShift([f.own]);
	await view.rerender(<HomeRoute />);
	expect(screen.queryByTestId("tech-second")).toBeNull();
});

test("original historical/off-shift display stays self-only", async () => {
	const f = teamFixture();
	const view = await render(<HomeRoute />);
	jest.mocked(isToday).mockReturnValue(false);
	// The date predicate is memoized by selected date; remount to simulate that change.
	await view.unmount();
	const past = await render(<HomeRoute />);
	expect(screen.queryByTestId("tech-second")).toBeNull();
	expect(screen.getByTestId("tech-first")).toBeTruthy();
	await past.unmount();
	jest.mocked(isToday).mockReturnValue(true);
	f.setShift([f.coworker]);
	await render(<HomeRoute />);
	expect(screen.queryByTestId("tech-second")).toBeNull();
});

test("real overview card uses summary name/amounts, skips private lookup and keeps own-only entry", async () => {
	const { TechnicianCard } = jest.requireActual<
		typeof import("@/components/Cards/technician-card")
	>("@/components/Cards/technician-card");
	const navigate = jest.fn();
	jest.mocked(useRouter).mockReturnValue({ navigate } as never);
	jest.mocked(useQuery).mockImplementation((_reference, ...args) => {
		if (args[0] !== "skip") throw new Error("Private profile lookup");
		return undefined as never;
	});
	const item = {
		_id: "second",
		_creationTime: 0,
		name: "Second",
		compensation: 125,
		tip: 15,
	} as User;
	const view = await render(<TechnicianCard overview item={item} />);
	expect(screen.getByText("Second")).toBeTruthy();
	expect(screen.getByText("$125")).toBeTruthy();
	await fireEvent.press(screen.getByLabelText("Add earning for Second"));
	expect(navigate).not.toHaveBeenCalled();
	await view.rerender(<TechnicianCard overview item={item} isAuthorized />);
	await fireEvent.press(screen.getByLabelText("Add earning for Second"));
	expect(navigate).toHaveBeenCalledWith("/technician/second/create");
});
