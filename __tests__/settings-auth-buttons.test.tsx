import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import SettingsRoute from "@/app/(root)/(main)/settings";

jest.mock("react-native-reanimated", () => ({
	__esModule: true,
	default: {
		View: jest.requireActual<typeof import("react-native")>("react-native")
			.View,
	},
}));

const mockSignOut = jest.fn<() => Promise<void>>();
const mockChangePassword = jest.fn<(args: unknown) => Promise<void>>();
jest.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({ signOut: mockSignOut }),
}));
jest.mock("convex/react", () => ({
	useQuery: () => ({
		name: "Test Staff",
		email: "staff@example.test",
		_creationTime: 0,
	}),
	useAction: () => mockChangePassword,
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/convex/_generated/api", () => ({
	api: { users: { viewer: "viewer", changePassword: "change" } },
}));

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(console, "error").mockImplementation(() => {});
	jest.replaceProperty(Platform, "OS", "web");
	jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => {
	jest.restoreAllMocks();
});
const mount = () =>
	render(
		<PaperProvider>
			<SettingsRoute />
		</PaperProvider>,
	);

test("web reset confirmation opens the password form", async () => {
	await mount();
	await fireEvent.press(screen.getByText("Reset Password"));
	expect(
		screen.getByText("Are you sure you want to reset your password?"),
	).toBeTruthy();
	const resetPasswordButton = screen.getAllByText("Reset Password").at(-1);
	expect(resetPasswordButton).toBeTruthy();
	if (!resetPasswordButton) {
		throw new Error("Reset Password button was not found");
	}
	await fireEvent.press(resetPasswordButton);
	expect(screen.getByPlaceholderText("Current password")).toBeTruthy();
});

const confirmLast = async (label: string) => {
	const actionButton = screen.getAllByText(label).at(-1);
	expect(actionButton).toBeTruthy();
	if (!actionButton) {
		throw new Error(`${label} button was not found`);
	}
	await fireEvent.press(actionButton);
};

test("web confirmations can be cancelled without auth effects", async () => {
	await mount();
	await fireEvent.press(screen.getByText("Reset Password"));
	await fireEvent.press(screen.getByText("Cancel"));
	expect(screen.queryByPlaceholderText("Current password")).toBeNull();
	await fireEvent.press(screen.getByText("Sign Out"));
	await fireEvent.press(screen.getByText("Cancel"));
	expect(mockSignOut).not.toHaveBeenCalled();
});

test("sign out stays pending, rejects visibly, and allows retry", async () => {
	let reject!: (reason: Error) => void;
	mockSignOut
		.mockImplementationOnce(
			() =>
				new Promise((_, rejectPromise) => {
					reject = rejectPromise;
				}),
		)
		.mockResolvedValueOnce(undefined);
	await mount();
	await fireEvent.press(screen.getByText("Sign Out"));
	await confirmLast("Sign Out");
	expect(mockSignOut).toHaveBeenCalledTimes(1);
	expect(screen.getByRole("button", { name: "Signing Out..." })).toBeDisabled();
	await act(async () => reject(new Error("Synthetic sign-out failure")));
	expect(screen.getByText("Synthetic sign-out failure")).toBeTruthy();
	await fireEvent.press(screen.getByText("OK"));
	await fireEvent.press(screen.getByText("Sign Out"));
	await confirmLast("Sign Out");
	expect(mockSignOut).toHaveBeenCalledTimes(2);
	expect(screen.getByRole("button", { name: "Sign Out" })).toBeEnabled();
});

test("password validation and rejected saves preserve draft for successful retry", async () => {
	mockChangePassword
		.mockRejectedValueOnce(new Error("Synthetic password failure"))
		.mockResolvedValueOnce(undefined);
	await mount();
	await fireEvent.press(screen.getByText("Reset Password"));
	await confirmLast("Reset Password");
	await fireEvent.press(screen.getByText("Update Password"));
	expect(screen.getByText("Please enter your current password")).toBeTruthy();
	expect(mockChangePassword).not.toHaveBeenCalled();
	await fireEvent.press(screen.getByText("OK"));
	await fireEvent.changeText(
		screen.getByPlaceholderText("Current password"),
		"synthetic-old",
	);
	await fireEvent.changeText(
		screen.getByPlaceholderText("New password"),
		"synthetic-new",
	);
	await fireEvent.changeText(
		screen.getByPlaceholderText("Confirm new password"),
		"synthetic-new",
	);
	await fireEvent.press(screen.getByText("Update Password"));
	expect(screen.getByText("Synthetic password failure")).toBeTruthy();
	expect(screen.getByPlaceholderText("Current password").props.value).toBe(
		"synthetic-old",
	);
	await fireEvent.press(screen.getByText("OK"));
	await fireEvent.press(screen.getByText("Update Password"));
	expect(mockChangePassword).toHaveBeenLastCalledWith({
		email: "staff@example.test",
		oldPassword: "synthetic-old",
		newPassword: "synthetic-new",
	});
	expect(screen.getByText("Password updated successfully.")).toBeTruthy();
	expect(screen.queryByPlaceholderText("Current password")).toBeNull();
});

test("native confirmations still use Alert callbacks", async () => {
	jest.replaceProperty(Platform, "OS", "ios");
	await mount();
	await fireEvent.press(screen.getByText("Reset Password"));
	const confirmReset = jest.mocked(Alert.alert).mock.calls[0]?.[2]?.[1]
		?.onPress;
	if (!confirmReset) {
		throw new Error("Native reset confirmation callback was not found");
	}
	await act(async () => confirmReset());
	expect(screen.getByPlaceholderText("Current password")).toBeTruthy();
});

test("Settings password visibility resets when the form is reopened", async () => {
	await mount();
	await fireEvent.press(screen.getByText("Reset Password"));
	await confirmLast("Reset Password");
	await fireEvent.press(screen.getByLabelText("Show current password"));
	expect(
		screen.getByPlaceholderText("Current password").props.secureTextEntry,
	).toBe(false);
	expect(
		screen.getByPlaceholderText("New password").props.secureTextEntry,
	).toBe(true);
	await fireEvent.press(screen.getByText("Cancel"));
	await fireEvent.press(screen.getByText("Reset Password"));
	await confirmLast("Reset Password");
	expect(
		screen.getByPlaceholderText("Current password").props.secureTextEntry,
	).toBe(true);
});
