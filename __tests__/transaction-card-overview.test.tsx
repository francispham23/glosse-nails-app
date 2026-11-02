import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { TransactionCard } from "@/components/Cards/transaction-card";
import {
	getWorkspaceLayout,
	useWorkspaceLayout,
} from "@/hooks/use-workspace-layout";
import type { Transaction } from "@/utils";

jest.mock("react-native-reanimated", () => ({
	default: {
		View: jest.requireActual<typeof import("react-native")>("react-native")
			.View,
	},
	FadeIn: {},
	FadeOut: {},
}));
jest.mock("expo-router", () => ({ router: { navigate: jest.fn() } }));
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({ endOfDay: new Date() }),
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/hooks/use-workspace-layout", () => ({
	...jest.requireActual<typeof import("@/hooks/use-workspace-layout")>(
		"@/hooks/use-workspace-layout",
	),
	useWorkspaceLayout: jest.fn(),
}));

const transaction = {
	_id: "entry",
	technician: "Lyly",
	compensation: 333,
	tip: 21,
	serviceDate: Date.now(),
} as Transaction;

test("compact summary preserves amounts and edit navigation while optional details are absent", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(390));
	await render(
		<TransactionCard overview transaction={transaction} isAuthorized />,
	);
	expect(screen.getByText("Lyly")).toBeTruthy();
	expect(screen.getByText("$333")).toBeTruthy();
	expect(screen.getByText("$21")).toBeTruthy();
	expect(screen.queryByText(/^Client:/)).toBeNull();
	await fireEvent.press(
		screen.getByRole("button", { name: /^Transaction for Lyly/ }),
	);
	expect(router.navigate).toHaveBeenCalledWith("/transaction/entry/edit");
});

test("long client/services remain present and a denied card cannot navigate", async () => {
	jest.mocked(useWorkspaceLayout).mockReturnValue(getWorkspaceLayout(320));
	const details = {
		...transaction,
		client: "A client with a long name",
		services: "Gel extensions, detailed artwork and removal",
	};
	await render(
		<TransactionCard
			overview
			transaction={details}
			isAuthorized={false}
			userName="Another technician"
		/>,
	);
	expect(screen.getByText(`Client: ${details.client}`)).toBeTruthy();
	expect(screen.getByText(details.services)).toBeTruthy();
	const calls = jest.mocked(router.navigate).mock.calls.length;
	await fireEvent.press(
		screen.getByRole("button", {
			name: /^Transaction for Lyly/,
			disabled: true,
		}),
	);
	expect(router.navigate).toHaveBeenCalledTimes(calls);
});
