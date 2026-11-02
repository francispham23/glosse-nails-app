import { expect, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { PaperProvider } from "react-native-paper";
import { PasswordInput } from "@/components/Form/password-input";

function Fields() {
	const [password, setPassword] = useState("");
	return (
		<PaperProvider>
			<PasswordInput
				placeholder="Password"
				visibilityLabel="password"
				value={password}
				onChangeText={setPassword}
			/>
			<PasswordInput placeholder="Confirm" visibilityLabel="confirmation" />
		</PaperProvider>
	);
}

test("passwords start masked and toggle independently without changing values", async () => {
	await render(<Fields />);
	await fireEvent.changeText(
		screen.getByPlaceholderText("Password"),
		"synthetic-value",
	);
	expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
		true,
	);
	await fireEvent.press(screen.getByLabelText("Show password"));
	expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
		false,
	);
	expect(screen.getByPlaceholderText("Password").props.value).toBe(
		"synthetic-value",
	);
	expect(screen.getByPlaceholderText("Confirm").props.secureTextEntry).toBe(
		true,
	);
	await fireEvent.press(screen.getByLabelText("Hide password"));
	expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
		true,
	);
	expect(screen.getByPlaceholderText("Password").props.value).toBe(
		"synthetic-value",
	);
});

test("password input disables capitalization and correction and supports credential autocomplete", async () => {
	await render(
		<PaperProvider>
			<PasswordInput
				placeholder="Login password"
				visibilityLabel="password"
				autoComplete="current-password"
			/>
			<PasswordInput
				placeholder="New password"
				visibilityLabel="new password"
				autoComplete="new-password"
			/>
		</PaperProvider>,
	);
	const password = screen.getByPlaceholderText("Login password");
	expect(password.props.autoCapitalize).toBe("none");
	expect(password.props.autoCorrect).toBe(false);
	expect(password.props.autoComplete).toBe("current-password");
	expect(screen.getByPlaceholderText("New password").props.autoComplete).toBe(
		"new-password",
	);
});
