import { beforeEach, expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import CreateRoute from "@/app/(root)/(main)/technician/[technicianId]/create";
import EditRoute from "@/app/(root)/(main)/transaction/[transactionId]/edit";
import { HeaderButton } from "@/components/Buttons/header-button";
import type { TransactionForm } from "@/components/TransactionForm";

const mockMutation = jest.fn<(args: unknown) => Promise<unknown>>();
let mockReturn: () => void;
let mockHeader: {
	headerLeft: () => React.ReactNode;
	headerRight?: () => React.ReactNode;
};
const mockRouter = {
	replace: jest.fn(),
	navigate: jest.fn(),
	back: jest.fn(),
	canGoBack: jest.fn(() => true),
};
let mockForm: ComponentProps<typeof TransactionForm>;
const mockStored = {
	_id: "transaction",
	technician: "tech",
	compensation: 100,
	compensationMethods: ["Cash", "Gift Card"],
	compInCash: 60,
	compInGift: 40,
	tip: 20,
	tipMethods: ["Cash", "Gift Card"],
	tipInCash: 15,
	tipInGift: 5,
	giftCode: "gift-id",
	supply: 2,
	discount: 3,
	discountType: "Amount",
	services: ["service"] as ComponentProps<
		typeof TransactionForm
	>["earning"]["services"],
	serviceDate: 1000,
};
jest.mock("expo-router", () => ({
	Link: ({
		children,
		onPress,
	}: {
		children: React.ReactElement;
		onPress: () => void;
	}) => {
		const React = jest.requireActual<typeof import("react")>("react");
		return React.cloneElement(children, { onPress } as Partial<
			typeof children.props
		>);
	},
	Stack: {
		Screen: ({ options }: { options: typeof mockHeader }) => {
			mockHeader = options;
			return null;
		},
	},
	router: mockRouter,
	useRouter: () => mockRouter,
	useLocalSearchParams: () => ({
		technicianId: "tech",
		transactionId: "transaction",
	}),
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
				? [{ _id: "gift-id", code: "TEST" }]
				: { name: "Runtime Technician" },
}));
jest.mock("@/utils", () => ({
	...jest.requireActual<typeof import("@/utils")>("@/utils"),
	useThemeColor: () => "black",
}));
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({ midDay: new Date() }),
}));
jest.mock("@/hooks/use-authorization", () => ({
	useAuthorization: () => ({ isAuthorized: true }),
}));
jest.mock("@/components/TransactionForm", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { View, Text, TextInput, Pressable } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		TransactionForm: (props: ComponentProps<typeof TransactionForm>) => {
			mockForm = props;
			return React.createElement(
				View,
				null,
				React.createElement(TextInput, {
					testID: "charge",
					value: props.earning.compensation,
					onChangeText: (value: string) =>
						props.setEarning((old) => ({ ...old, compensation: value })),
				}),
				props.saveError
					? React.createElement(
							Text,
							{ accessibilityRole: "alert" },
							props.saveError,
						)
					: null,
				React.createElement(
					Pressable,
					{
						onPress: props.onSubmit,
						disabled: props.isLoading || props.submitDisabled,
					},
					React.createElement(Text, null, "Save"),
				),
			);
		},
	};
});
jest.mock("react-native-paper", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { View, Text, Pressable } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		Text,
		ActivityIndicator: View,
		Button: ({
			onPress,
			children,
		}: {
			onPress: () => void;
			children: React.ReactNode;
		}) => {
			mockReturn = onPress;
			return React.createElement(
				Pressable,
				{ onPress },
				React.createElement(Text, null, children),
			);
		},
	};
});
beforeEach(() => {
	jest.clearAllMocks();
	mockMutation.mockReset();
	mockRouter.replace.mockReset();
	mockRouter.back.mockReset();
	mockRouter.canGoBack.mockReturnValue(true);
});

for (const [name, Route] of [
	["create", CreateRoute],
	["edit", EditRoute],
] as const) {
	test(`${name} returns automatically after saving without a success acknowledgement`, async () => {
		mockMutation.mockResolvedValue(null);
		await render(<Route />);
		await fireEvent.press(screen.getByText("Save"));
		expect(mockRouter.back).toHaveBeenCalledTimes(1);
		expect(mockRouter.replace).not.toHaveBeenCalled();
		expect(screen.queryByText("OK")).toBeNull();
	});
}

for (const [name, Route] of [
	["create", CreateRoute],
	["edit", EditRoute],
] as const) {
	test(`${name} rejection preserves the entire draft and retry submits current values`, async () => {
		mockMutation
			.mockRejectedValueOnce(
				Object.assign(
					new Error("[CONVEX M(transactions:addTransaction)] Server Error"),
					{ data: "Insufficient gift card balance" },
				),
			)
			.mockResolvedValueOnce(null);
		await render(<Route />);
		await act(async () => {
			mockForm.setEarning((old) => ({
				...old,
				compensation: "120",
				compInCash: "80",
				compInGift: "40",
				giftCode: "TEST",
				compensationMethods: ["Cash", "Gift Card"],
				tip: "20",
				tipMethods: ["Cash", "Gift Card"],
				tipInGift: "5",
				supply: "2",
				discount: "3",
				discountType: "Amount",
				serviceDate: 1000,
				services: ["service"] as ComponentProps<
					typeof TransactionForm
				>["earning"]["services"],
			}));
			mockForm.setSelectedInputs(["Supply", "Discount"]);
		});
		const draft = structuredClone(mockForm.earning);
		await fireEvent.press(screen.getByText("Save"));
		expect(mockForm.earning).toEqual(draft);
		expect(screen.getByText("Insufficient gift card balance")).toBeTruthy();
		expect(mockForm.selectedInputs).toEqual(["Supply", "Discount"]);
		expect(mockForm.isLoading).toBe(false);
		expect(mockForm.submitDisabled).toBe(false);
		expect(mockRouter.replace).not.toHaveBeenCalled();
		expect(mockRouter.back).not.toHaveBeenCalled();
		await fireEvent.changeText(screen.getByTestId("charge"), "125");
		await fireEvent.press(screen.getByText("Save"));
		expect(mockMutation).toHaveBeenCalledTimes(2);
		expect(mockMutation.mock.calls[1][0]).toEqual(
			expect.objectContaining({
				body: expect.objectContaining({ ...draft, compensation: "125" }),
			}),
		);
		expect(screen.queryByText("Insufficient gift card balance")).toBeNull();
		expect(mockRouter.replace).not.toHaveBeenCalled();
		expect(mockRouter.back).toHaveBeenCalledTimes(1);
	});
	test(`${name} blocks duplicate requests and same-turn return taps`, async () => {
		let resolve!: (value: unknown) => void;
		mockMutation.mockImplementation(
			() =>
				new Promise((done) => {
					resolve = done;
				}),
		);
		await render(<Route />);
		await act(async () => {
			void mockForm.onSubmit();
			void mockForm.onSubmit();
		});
		expect(mockMutation).toHaveBeenCalledTimes(1);
		expect(mockForm.submitDisabled).toBe(true);
		expect(mockRouter.back).not.toHaveBeenCalled();
		expect(mockRouter.replace).not.toHaveBeenCalled();
		await act(async () => {
			resolve(null);
		});
		expect(mockRouter.back).toHaveBeenCalledTimes(1);
		await act(async () => {
			void mockForm.onSubmit();
		});
		expect(mockMutation).toHaveBeenCalledTimes(1);
		await act(async () => {
			mockReturn();
			mockReturn();
		});
		expect(
			mockRouter.back.mock.calls.length + mockRouter.replace.mock.calls.length,
		).toBe(2);
	});
	test(`${name} supplies useful fallback feedback for an unknown rejection`, async () => {
		mockMutation.mockRejectedValue(undefined);
		await render(<Route />);
		await fireEvent.press(screen.getByText("Save"));
		expect(mockForm.saveError).toBe(
			name === "create"
				? "Failed to save earning. Please try again."
				: "Failed to update transaction. Please try again.",
		);
	});
}
for (const [name, Route] of [
	["create", CreateRoute],
	["edit", EditRoute],
] as const) {
	test(`${name} returns to nonmodal Earnings without back history`, async () => {
		mockRouter.canGoBack.mockReturnValue(false);
		mockMutation.mockResolvedValue(null);
		await render(<Route />);
		await fireEvent.press(screen.getByText("Save"));
		expect(mockRouter.replace).toHaveBeenCalledWith("/earnings");
		expect(mockRouter.back).not.toHaveBeenCalled();
	});
	test(`${name} extracts a structured wrapped Convex error`, async () => {
		mockMutation.mockRejectedValue(
			Object.assign(
				new Error("[CONVEX M(transactions:updateTransaction)] Server Error"),
				{ data: { message: "Please sign in to continue." } },
			),
		);
		await render(<Route />);
		await fireEvent.press(screen.getByText("Save"));
		expect(screen.getByText("Please sign in to continue.")).toBeTruthy();
	});
	test(`${name} locks native header and draft setters until failure or unmount`, async () => {
		let reject!: (reason: unknown) => void;
		mockMutation.mockImplementation(
			() =>
				new Promise((_, fail) => {
					reject = fail;
				}),
		);
		await render(<Route />);
		const previousHeader = mockHeader.headerLeft() as React.ReactElement<{
			isBlocked: () => boolean;
		}>;
		await act(async () => {
			void mockForm.onSubmit();
			expect(previousHeader.props.isBlocked()).toBe(true);
		});
		expect(
			(mockHeader.headerLeft() as React.ReactElement<{ disabled: boolean }>)
				.props.disabled,
		).toBe(true);
		if (name === "create")
			expect(
				(mockHeader.headerRight!() as React.ReactElement<{ disabled: boolean }>)
					.props.disabled,
			).toBe(true);
		const draft = structuredClone(mockForm.earning);
		await act(async () => {
			mockForm.setEarning((old) => ({ ...old, compensation: "999" }));
			mockForm.setSelectedInputs(["Discount"]);
		});
		expect(mockForm.earning).toEqual(draft);
		await act(async () => {
			reject(new Error("Rejected"));
		});
		expect(
			(mockHeader.headerLeft() as React.ReactElement<{ disabled: boolean }>)
				.props.disabled,
		).toBe(false);
	});
	test.each([true, false])(
		`${name} retains the saved draft and lets Return retry navigation (throws=%s)`,
		async (throws) => {
			mockMutation.mockResolvedValue(null);
			const navigation = mockRouter.back;
			if (throws)
				navigation.mockImplementationOnce(() => {
					throw new Error("Navigation failed");
				});
			await render(<Route />);
			await act(async () => {
				mockForm.setEarning((old) => ({ ...old, compensation: "125" }));
			});
			const draft = structuredClone(mockForm.earning);
			await fireEvent.press(screen.getByText("Save"));
			expect(navigation).toHaveBeenCalledTimes(1);
			expect(mockForm.saveError).toBe("");
			expect(mockForm.earning).toEqual(draft);
			expect(mockForm.submitDisabled).toBe(true);
			expect(
				(mockHeader.headerLeft() as React.ReactElement<{ disabled: boolean }>)
					.props.disabled,
			).toBe(true);
			await act(async () => {
				mockForm.setEarning((old) => ({ ...old, compensation: "999" }));
				void mockForm.onSubmit();
			});
			expect(mockForm.earning).toEqual(draft);
			await fireEvent.press(screen.getByText("Return to previous screen"));
			expect(navigation).toHaveBeenCalledTimes(2);
			expect(mockMutation).toHaveBeenCalledTimes(1);
		},
	);
	test(`${name} does not navigate after the form unmounts during a save`, async () => {
		let resolve!: (value: unknown) => void;
		mockMutation.mockImplementation(
			() =>
				new Promise((done) => {
					resolve = done;
				}),
		);
		const view = await render(<Route />);
		await act(async () => {
			void mockForm.onSubmit();
		});
		await view.unmount();
		await act(async () => {
			resolve(null);
		});
		expect(mockRouter.back).not.toHaveBeenCalled();
		expect(mockRouter.replace).not.toHaveBeenCalled();
	});
}

test("native close prevents Link navigation and swap ignores stale taps when the ref locks", async () => {
	let locked = false;
	const close = await render(
		<HeaderButton iconName="close" isBlocked={() => locked} />,
	);
	locked = true;
	const preventDefault = jest.fn();
	await fireEvent.press(screen.getByLabelText("Close"), { preventDefault });
	expect(preventDefault).toHaveBeenCalledTimes(1);
	await close.unmount();
	await render(
		<HeaderButton
			iconName="swap-horizontal-outline"
			route="/technician/tech"
			isBlocked={() => locked}
		/>,
	);
	await fireEvent.press(screen.getByLabelText("View technician"));
	expect(mockRouter.navigate).not.toHaveBeenCalled();
});

for (const [name, Route] of [
	["create", CreateRoute],
	["edit", EditRoute],
] as const) {
	test(`${name} keeps native options and draft setters stable across field edits`, async () => {
		await render(<Route />);
		const header = mockHeader;
		const setEarning = mockForm.setEarning;
		const setSelectedInputs = mockForm.setSelectedInputs;
		await act(async () => {
			setEarning((old) => ({ ...old, compensation: "123" }));
		});
		expect(mockHeader).toBe(header);
		expect(mockForm.setEarning).toBe(setEarning);
		expect(mockForm.setSelectedInputs).toBe(setSelectedInputs);
	});
}
