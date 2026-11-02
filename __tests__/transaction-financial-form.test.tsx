import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { normalizeFinancialInput } from "@/utils/financial-validation";
import type { EarningFormState } from "@/utils/types";

jest.mock("expo-router/react-navigation", () => ({ useHeaderHeight: () => 0 }));
jest.mock("convex/react", () => ({
	useQuery: (query: string, args: unknown) =>
		query === "gift" && args !== "skip" ? { balance: 200 } : [],
}));
jest.mock("@/convex/_generated/api", () => ({
	api: {
		categories: { getFormCategories: "categories" },
		giftCards: { getByCode: "gift" },
	},
}));
jest.mock("@/hooks", () => jest.requireActual("@/hooks/use-form-validation"));
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({ endOfDay: new Date(2000) }),
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/components/screen-scroll-view", () => ({
	ScreenScrollView:
		jest.requireActual<typeof import("react-native")>("react-native").View,
}));
jest.mock("@/components/TransactionForm/service-time-picker", () => ({
	ServiceTimePicker: () => null,
}));
jest.mock("@/components/Buttons/delete-button", () => ({
	DeleteButton: () => null,
}));
jest.mock("@/components/Form/form", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		__esModule: true,
		default: () => null,
		ErrorText: ({ error }: { error?: string }) =>
			error ? React.createElement(Text, null, error) : null,
	};
});
jest.mock("react-native-paper", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Text, TextInput, Pressable } =
		jest.requireActual<typeof import("react-native")>("react-native");
	const control = ({
		children,
		onPress,
		disabled,
	}: {
		children: React.ReactNode;
		onPress?: () => void;
		disabled?: boolean;
	}) =>
		React.createElement(
			Pressable,
			{ onPress, disabled },
			React.createElement(Text, null, children),
		);
	return {
		Button: control,
		Chip: control,
		Icon: () => null,
		Text,
		TextInput: Object.assign(TextInput, { Icon: () => null }),
		useTheme: () => ({ colors: {} }),
	};
});

const initial: EarningFormState = {
	technicianId: "tech" as EarningFormState["technicianId"],
	serviceDate: 1000,
	services: [],
	compensation: "100",
	compensationMethods: ["Cash", "Card", "Gift Card"],
	compInCash: "30",
	compInGift: "40",
	tip: "20",
	tipMethods: ["Cash", "Card", "Gift Card"],
	tipInCash: "5",
	tipInGift: "5",
	giftCode: "GIFT",
};
function Harness({
	onSubmit,
	input = initial,
	submitDisabled = false,
	saveError = "",
}: {
	onSubmit: (value: EarningFormState) => void;
	input?: EarningFormState;
	submitDisabled?: boolean;
	saveError?: string;
}) {
	const [earning, setEarning] = useState(input);
	const [giftError, setGiftError] = useState("");
	return (
		<TransactionForm
			type="create"
			title="Record"
			description=""
			earning={earning}
			setEarning={setEarning}
			onSubmit={() => onSubmit(earning)}
			isLoading={false}
			submitDisabled={submitDisabled}
			saveError={saveError}
			submitLabel="Save"
			open={false}
			setOpen={() => {}}
			giftError={giftError}
			setGiftError={setGiftError}
			selectedInputs={input.discount ? ["Discount"] : []}
			setSelectedInputs={() => {}}
		/>
	);
}

test("actual method controls clear hidden cash fields and keep updated remainder submittable", async () => {
	const submitted = jest.fn<(value: EarningFormState) => void>();
	await render(<Harness onSubmit={submitted} />);
	await fireEvent.press(screen.getAllByText("Card")[0]);
	expect(screen.getByText("Cash remainder: $60.00")).toBeTruthy();
	expect(screen.queryByPlaceholderText("Enter Cash Amount")).toBeNull();
	await fireEvent.press(screen.getAllByText("Card")[1]);
	expect(screen.getByText("Cash remainder: $15.00")).toBeTruthy();
	await fireEvent.changeText(
		screen.getByPlaceholderText("Enter Total Charge in Cash and Gift Card"),
		"120",
	);
	expect(screen.getByText("Cash remainder: $80.00")).toBeTruthy();
	await fireEvent.press(screen.getByText("Save"));
	expect(submitted).toHaveBeenCalledTimes(1);
	expect(submitted.mock.calls[0][0]).toMatchObject({
		compInCash: "",
		tipInCash: "",
	});
	expect(normalizeFinancialInput(submitted.mock.calls[0][0])).toMatchObject({
		compInCash: 80,
		tipInCash: 15,
	});
});

test("nonfinite draft supply cannot crash gift preview or pass submit validation", async () => {
	const submitted = jest.fn<(value: EarningFormState) => void>();
	await render(
		<Harness onSubmit={submitted} input={{ ...initial, supply: "Infinity" }} />,
	);
	await fireEvent.press(screen.getByText("Save"));
	expect(submitted).not.toHaveBeenCalled();
});

test.each([
	["1.005", "1.005", "", undefined],
	["1.005", "0.905", "0.10", "Amount" as const],
	["1.005", "0.905", "10", "Percent" as const],
])(
	"gift decimal tie remains submittable: service %s, gift %s, discount %s/%s",
	async (compensation, compInGift, discount, discountType) => {
		const submitted = jest.fn<(value: EarningFormState) => void>();
		const input: EarningFormState = {
			...initial,
			compensation,
			compInGift,
			compensationMethods: ["Gift Card"],
			compInCash: "",
			tip: "0",
			tipMethods: [],
			tipInCash: "",
			tipInGift: "",
			discount,
			discountType,
		};
		// Keep the discount control visible so its type remains part of the draft.
		await render(<Harness onSubmit={submitted} input={input} />);
		await fireEvent.press(screen.getByText("Save"));
		expect(submitted).toHaveBeenCalledTimes(1);
	},
);

test("real form displays server error and submitDisabled locks valid submission and draft changes", async () => {
	const submitted = jest.fn<(value: EarningFormState) => void>();
	const mounted = await render(
		<Harness
			onSubmit={submitted}
			submitDisabled
			saveError="Insufficient gift card balance"
		/>,
	);
	expect(screen.getByRole("alert").props.children).toBe(
		"Insufficient gift card balance",
	);
	await fireEvent.press(screen.getByText("Save"));
	await fireEvent.changeText(
		screen.getByPlaceholderText(
			"Enter Total Charge in Card, Cash and Gift Card",
		),
		"999",
	);
	expect(submitted).not.toHaveBeenCalled();
	await mounted.rerender(<Harness onSubmit={submitted} />);
	await fireEvent.press(screen.getByText("Save"));
	expect(submitted).toHaveBeenCalledTimes(1);
	expect(submitted.mock.calls[0][0].compensation).toBe("100");
});
