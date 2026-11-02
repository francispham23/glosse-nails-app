import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { router, Slot } from "expo-router";
import {
	act,
	fireEvent,
	renderRouter,
	screen,
} from "expo-router/testing-library";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import MainLayout from "@/app/(root)/(main)/_layout";
import TechnicianLayout from "@/app/(root)/(main)/technician/_layout";
import CreateRoute from "@/app/(root)/(main)/technician/[technicianId]/create";
import TransactionLayout from "@/app/(root)/(main)/transaction/_layout";
import EditRoute from "@/app/(root)/(main)/transaction/[transactionId]/edit";
import type { TransactionForm } from "@/components/TransactionForm";

const mockMutation = jest.fn<(args: unknown) => Promise<unknown>>();
const mockOptions = { standard: {}, root: {}, modal: {} };
const mockStored = {
	_id: "transaction",
	technician: "tech",
	client: "tech",
	compensation: 100,
	compensationMethods: ["Card"],
	tip: 20,
	tipMethods: ["Card"],
	serviceDate: 1000,
};
jest.mock("@/components/Buttons/theme-toggle-button", () => ({
	ThemeToggleButton: () => null,
}));
jest.mock("@/hooks", () => ({ useNavigationOptions: () => mockOptions }));
jest.mock("@/hooks/use-navigation-options", () => ({
	useNavigationOptions: () => mockOptions,
}));
jest.mock("@/hooks/use-authorization", () => ({
	useAuthorization: () => ({ isAuthorized: true }),
}));
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({ midDay: new Date() }),
}));
jest.mock("@/utils", () => ({
	...jest.requireActual<typeof import("@/utils")>("@/utils"),
	useThemeColor: () => "black",
}));
jest.mock("@/convex/_generated/api", () => ({
	api: {
		users: { getUserById: "user" },
		transactions: {
			getById: "transaction",
			addTransaction: "add",
			updateTransaction: "update",
		},
		giftCards: { list: "cards" },
	},
}));
jest.mock("convex/react", () => ({
	useMutation: () => mockMutation,
	useQuery: (query: string) =>
		query === "transaction"
			? mockStored
			: query === "cards"
				? []
				: { name: "Synthetic Technician" },
}));
jest.mock("@/components/TransactionForm", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { View, Pressable, Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		TransactionForm: (props: ComponentProps<typeof TransactionForm>) =>
			React.createElement(
				View,
				null,
				React.createElement(
					Pressable,
					{ onPress: props.onSubmit, disabled: props.submitDisabled },
					React.createElement(Text, null, "Save transaction"),
				),
			),
	};
});

function Earnings() {
	return (
		<View>
			<Text>Earnings home</Text>
			<Pressable onPress={() => router.navigate("/technician/tech/create")}>
				<Text>New transaction</Text>
			</Pressable>
		</View>
	);
}
function TechnicianList() {
	return (
		<View>
			<Text>Technician transactions</Text>
			<Pressable
				onPress={() => router.navigate("/transaction/transaction/edit")}
			>
				<Text>Edit transaction</Text>
			</Pressable>
		</View>
	);
}
const context = {
	_layout: () => (
		<PaperProvider>
			<MainLayout />
		</PaperProvider>
	),
	"(tabs)/_layout": Slot,
	"(tabs)/earnings/index": Earnings,
	"technician/_layout": TechnicianLayout,
	"technician/[technicianId]/create": CreateRoute,
	"technician/[technicianId]/index": TechnicianList,
	"transaction/_layout": TransactionLayout,
	"transaction/[transactionId]/edit": EditRoute,
	"gift/index": () => null,
	"report/index": () => null,
	"pick-date": () => null,
	settings: () => null,
};
beforeEach(() => {
	mockMutation.mockReset();
	mockMutation.mockResolvedValue(null);
});
afterEach(() => {
	jest.useRealTimers();
});

test("create save removes the technician modal and returns to Earnings", async () => {
	const app = renderRouter(context, { initialUrl: "/earnings" });
	await app;
	await fireEvent.press(screen.getByText("New transaction"));
	expect(app.getPathname()).toBe("/technician/tech/create");
	expect(
		app.getRouterState()?.routes[0].state?.routes.map((route) => route.name),
	).toEqual(["(tabs)", "technician"]);
	await fireEvent.press(screen.getByText("Save transaction"));
	expect(app.getPathname()).toBe("/earnings");
	expect(
		app.getRouterState()?.routes[0].state?.routes.map((route) => route.name),
	).toEqual(["(tabs)"]);
	expect(mockMutation).toHaveBeenCalledTimes(1);
});

test("edit save removes its modal and returns to the originating technician list", async () => {
	const app = renderRouter(context, { initialUrl: "/earnings" });
	await app;
	await act(async () => {
		router.navigate("/technician/tech");
	});
	await fireEvent.press(screen.getByText("Edit transaction"));
	expect(app.getPathname()).toBe("/transaction/transaction/edit");
	expect(
		app.getRouterState()?.routes[0].state?.routes.map((route) => route.name),
	).toEqual(["(tabs)", "technician", "transaction"]);
	await fireEvent.press(screen.getByText("Save transaction"));
	expect(app.getPathname()).toBe("/technician/tech");
	expect(
		app.getRouterState()?.routes[0].state?.routes.map((route) => route.name),
	).toEqual(["(tabs)", "technician"]);
	expect(mockMutation).toHaveBeenCalledTimes(1);
});

test.each(["/technician/tech/create", "/transaction/transaction/edit"])(
	"direct entry %s returns to nonmodal Earnings",
	async (initialUrl) => {
		const app = renderRouter(context, { initialUrl });
		await app;
		await fireEvent.press(screen.getByText("Save transaction"));
		expect(app.getPathname()).toBe("/earnings");
		expect(
			app.getRouterState()?.routes[0].state?.routes.map((route) => route.name),
		).toEqual(["(tabs)"]);
	},
);
