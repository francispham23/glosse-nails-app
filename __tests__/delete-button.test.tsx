import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import { DeleteButton } from "@/components/Buttons/delete-button";
import { DeleteDialogProvider } from "@/components/Buttons/delete-dialog";
import type { Id } from "@/convex/_generated/dataModel";

const mockDelete = jest.fn<(args: unknown) => Promise<void>>();
jest.mock("convex/react", () => ({ useMutation: () => mockDelete }));
jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
beforeEach(() => {
	jest.clearAllMocks();
	mockDelete.mockReset();
	jest.replaceProperty(Platform, "OS", "web");
	jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => {
	jest.restoreAllMocks();
});

test("web delete opens a confirmation without deleting", async () => {
	await render(
		<PaperProvider>
			<DeleteButton
				type="transactions"
				id={"synthetic-id" as Id<"transactions">}
			/>
		</PaperProvider>,
	);
	await fireEvent.press(screen.getByText("Delete transactions"));
	expect(screen.getByText(/Are you sure you want to delete/)).toBeTruthy();
	expect(mockDelete).not.toHaveBeenCalled();
});

test.each(["transactions", "giftCards"] as const)(
	"%s cancel and backdrop dismissal do not delete",
	async (type) => {
		await render(
			<PaperProvider>
				<DeleteButton type={type} id={"synthetic-id" as Id<typeof type>} />
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByText(`Delete ${type}`));
		await fireEvent.press(screen.getByText("Cancel"));
		expect(screen.queryByText(/Are you sure/)).toBeNull();
		await fireEvent.press(screen.getByText(`Delete ${type}`));
		await fireEvent.press(screen.getByTestId("delete-dialog-backdrop"));
		expect(screen.queryByText(/Are you sure/)).toBeNull();
		expect(mockDelete).not.toHaveBeenCalled();
	},
);

test("confirm locks duplicate submissions and only acknowledges navigation once", async () => {
	let resolve!: () => void;
	mockDelete.mockImplementationOnce(
		() =>
			new Promise<void>((done) => {
				resolve = done;
			}),
	);
	await render(
		<PaperProvider>
			<DeleteButton
				type="transactions"
				id={"synthetic-id" as Id<"transactions">}
			/>
		</PaperProvider>,
	);
	await fireEvent.press(screen.getByText("Delete transactions"));
	await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
	for (const button of screen.getAllByRole("button", { name: "Deleting..." }))
		await fireEvent.press(button);
	expect(mockDelete).toHaveBeenCalledTimes(1);
	expect(mockDelete).toHaveBeenCalledWith({ id: "synthetic-id" });
	expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
	await fireEvent.press(screen.getByTestId("delete-dialog-backdrop"));
	expect(screen.getByText("Deleting transaction...")).toBeTruthy();
	await act(async () => {
		resolve();
	});
	expect(screen.getByText("Transaction deleted successfully.")).toBeTruthy();
	expect(router.back).not.toHaveBeenCalled();
	await fireEvent.press(screen.getByRole("button", { name: "OK" }));
	expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
	expect(router.back).toHaveBeenCalledTimes(1);
	expect(mockDelete).toHaveBeenCalledTimes(1);
});

test("rejection shows error and allows a successful retry", async () => {
	mockDelete
		.mockRejectedValueOnce(new Error("synthetic rejection"))
		.mockResolvedValueOnce();
	await render(
		<PaperProvider>
			<DeleteButton
				type="transactions"
				id={"synthetic-id" as Id<"transactions">}
			/>
		</PaperProvider>,
	);
	await fireEvent.press(screen.getByText("Delete transactions"));
	await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
	expect(
		screen.getByText("Failed to delete transaction. Please try again."),
	).toBeTruthy();
	expect(router.back).not.toHaveBeenCalled();
	await fireEvent.press(screen.getByText("OK"));
	await fireEvent.press(screen.getByText("Delete transactions"));
	await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
	expect(screen.getByText("Transaction deleted successfully.")).toBeTruthy();
	expect(mockDelete).toHaveBeenCalledTimes(2);
});

test("missing ID and disabled button do not delete", async () => {
	await render(
		<PaperProvider>
			<DeleteButton type="transactions" id={undefined} />
			<DeleteButton
				type="giftCards"
				id={"synthetic-id" as Id<"giftCards">}
				isDisabled
			/>
		</PaperProvider>,
	);
	await fireEvent.press(screen.getByText("Delete giftCards"));
	expect(screen.queryByText(/Are you sure/)).toBeNull();
	await fireEvent.press(screen.getByText("Delete transactions"));
	await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
	expect(screen.getByText("ID is missing. Cannot delete.")).toBeTruthy();
	expect(mockDelete).not.toHaveBeenCalled();
});

test.each(["transactions", "giftCards"] as const)(
	"%s feedback survives subscription removing its delete button",
	async (type) => {
		let remove!: () => void;
		function GiftList() {
			const [exists, setExists] = useState(true);
			remove = () => setExists(false);
			return (
				<DeleteDialogProvider>
					{exists ? (
						<DeleteButton type={type} id={"synthetic-id" as Id<typeof type>} />
					) : null}
				</DeleteDialogProvider>
			);
		}
		mockDelete.mockImplementationOnce(async () => {
			remove();
		});
		await render(
			<PaperProvider>
				<GiftList />
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByText(`Delete ${type}`));
		await fireEvent.press(screen.getByRole("button", { name: "Delete" }));
		expect(screen.queryByText(`Delete ${type}`)).toBeNull();
		expect(
			screen.getByText(
				`${type === "transactions" ? "Transaction" : "Gift card"} deleted successfully.`,
			),
		).toBeTruthy();
		await fireEvent.press(screen.getByText("OK"));
		expect(
			screen.queryByText(
				`${type === "transactions" ? "Transaction" : "Gift card"} deleted successfully.`,
			),
		).toBeNull();
		expect(router.back).toHaveBeenCalledTimes(type === "transactions" ? 1 : 0);
	},
);

test.each(["transactions", "giftCards"] as const)(
	"native %s keeps Alert confirmation and result",
	async (type) => {
		jest.replaceProperty(Platform, "OS", "ios");
		mockDelete.mockResolvedValueOnce();
		await render(
			<PaperProvider>
				<DeleteButton type={type} id={"synthetic-id" as Id<typeof type>} />
			</PaperProvider>,
		);
		await fireEvent.press(screen.getByText(`Delete ${type}`));
		const alertCall = jest.mocked(Alert.alert).mock.calls[0];
		expect(alertCall).toBeDefined();
		const buttons = alertCall?.[2];
		if (!buttons) {
			throw new Error("Expected native confirmation alert buttons");
		}
		expect(buttons[0].style).toBe("cancel");
		expect(mockDelete).not.toHaveBeenCalled();
		await act(async () => {
			buttons[1].onPress?.();
		});
		expect(mockDelete).toHaveBeenCalledWith({ id: "synthetic-id" });
		expect(jest.mocked(Alert.alert).mock.calls[1][0]).toBe("Success");
		const successAlertCall = jest.mocked(Alert.alert).mock.calls[1];
		const successButtons = successAlertCall?.[2];
		if (!successButtons) {
			throw new Error("Expected native success alert buttons");
		}
		await act(() => {
			successButtons[0].onPress?.();
		});
		expect(router.back).toHaveBeenCalledTimes(type === "transactions" ? 1 : 0);
	},
);
