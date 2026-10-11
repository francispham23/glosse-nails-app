import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import { PaperProvider } from "react-native-paper";
import SignInRoute from "@/app/(root)/(auth)/email/signin";

const mockSignIn = jest.fn<(...args: unknown[]) => Promise<void>>();
jest.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({ signIn: mockSignIn }),
}));
jest.mock("@/utils", () => ({
	isProduction: true,
	useThemeColor: () => "#5b4fe0",
	cn: (...values: string[]) => values.join(" "),
}));

beforeEach(() => {
	jest.clearAllMocks();
	jest.replaceProperty(Platform, "OS", "web");
	jest.spyOn(console, "error").mockImplementation(() => {});
	jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => {
	jest.restoreAllMocks();
});
const mount = () =>
	render(
		<PaperProvider>
			<SignInRoute />
		</PaperProvider>,
	);

test("web required fields show accessible feedback without submitting", async () => {
	await mount();
	await fireEvent.press(screen.getByText("Sign In"));
	expect(screen.getByRole("alert").props.children).toBe(
		"Please enter your email",
	);
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter your email"),
		"staff@example.test",
	);
	await fireEvent.press(screen.getByText("Sign In"));
	expect(screen.getByRole("alert").props.children).toBe(
		"Please enter your password",
	);
	expect(mockSignIn).not.toHaveBeenCalled();
});

test("rejection retains draft and allows a successful retry with unchanged auth parameters", async () => {
	mockSignIn
		.mockRejectedValueOnce(new Error("Synthetic rejection"))
		.mockResolvedValueOnce(undefined);
	await mount();
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter your email"),
		" Staff@Example.test ",
	);
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter your password"),
		"synthetic-password",
	);
	await fireEvent.press(screen.getByText("Sign In"));
	expect(screen.getByRole("alert").props.children).toBe("Synthetic rejection");
	expect(screen.getByPlaceholderText("Enter your password").props.value).toBe(
		"synthetic-password",
	);
	expect(screen.getByRole("button", { name: "Sign In" })).toBeEnabled();
	await fireEvent.press(screen.getByText("Sign In"));
	expect(screen.queryByRole("alert")).toBeNull();
	expect(mockSignIn).toHaveBeenLastCalledWith("password", {
		email: "staff@example.test",
		password: "synthetic-password",
		flow: "signIn",
	});
});

test("native validation continues using Alert", async () => {
	jest.replaceProperty(Platform, "OS", "ios");
	await mount();
	await fireEvent.press(screen.getByText("Sign In"));
	expect(Alert.alert).toHaveBeenCalledWith("Error", "Please enter your email");
	expect(screen.queryByRole("alert")).toBeNull();
});

test("Convex authentication errors show readable feedback instead of a stack", async () => {
	mockSignIn.mockRejectedValueOnce(
		new Error(
			"[CONVEX A(auth:signIn)] Server Error: InvalidAccountId at retrieveAccount",
		),
	);
	await mount();
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter your email"),
		"missing@example.test",
	);
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter your password"),
		"synthetic-invalid",
	);
	await fireEvent.press(screen.getByText("Sign In"));
	expect(screen.getByRole("alert").props.children).toBe(
		"Invalid email or password. Please try again.",
	);
});
