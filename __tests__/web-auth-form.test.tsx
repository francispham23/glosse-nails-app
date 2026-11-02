import { afterEach, expect, jest, test } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Platform, Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import ResetPasswordRoute from "@/app/(root)/(auth)/email/(reset)/reset-password";
import SignUpRoute from "@/app/(root)/(auth)/email/signup";
import { FormContainer } from "@/components/Form/form";

jest.mock("@convex-dev/auth/react", () => ({
	useAuthActions: () => ({ signIn: jest.fn() }),
}));
jest.mock("expo-router", () => ({
	Link: ({ children }: { children: React.ReactNode }) => children,
	useLocalSearchParams: () => ({ token: "synthetic-reset-token" }),
}));
jest.mock("@/utils", () => ({
	useThemeColor: () => "#5b4fe0",
	cn: (...values: string[]) => values.join(" "),
}));
afterEach(() => {
	jest.restoreAllMocks();
});

function expectPasswordForm(placeholder: string) {
	const input = screen.getByPlaceholderText(placeholder);
	let ancestor = input.parent;
	while (ancestor && ancestor.type !== "form") ancestor = ancestor.parent;
	expect(ancestor).not.toBeNull();
	expect(input.props.autoComplete).toBe("new-password");
	expect(input.props.autoCapitalize).toBe("none");
	expect(input.props.autoCorrect).toBe(false);
}

test("signup password fields share web form semantics and new-password hints", async () => {
	jest.replaceProperty(Platform, "OS", "web");
	await render(
		<PaperProvider>
			<SignUpRoute />
		</PaperProvider>,
	);
	expectPasswordForm("Enter your password");
	expectPasswordForm("Confirm your password");
});

test("reset password fields have form semantics without implementing reset", async () => {
	jest.replaceProperty(Platform, "OS", "web");
	await render(
		<PaperProvider>
			<ResetPasswordRoute />
		</PaperProvider>,
	);
	expectPasswordForm("Enter your new password");
	expectPasswordForm("Confirm your new password");
});

test("shared containers remain Views on native and when web form is not requested", async () => {
	jest.replaceProperty(Platform, "OS", "ios");
	await render(
		<FormContainer webForm>
			<Text>Native content</Text>
		</FormContainer>,
	);
	expect(screen.getByText("Native content").parent?.type).toBe("View");
	jest.replaceProperty(Platform, "OS", "web");
	await render(
		<FormContainer>
			<Text>Settings content</Text>
		</FormContainer>,
	);
	expect(screen.getByText("Settings content").parent?.type).toBe("View");
});
