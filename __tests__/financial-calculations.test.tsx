import { expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useQuery } from "convex/react";
import EarningsRoute from "@/app/(root)/(main)/(tabs)/earnings";
import ReportsRoute from "@/app/(root)/(main)/(tabs)/reports";
import CashReportRoute from "@/app/(root)/(main)/report/cash";
import GiftReportRoute from "@/app/(root)/(main)/report/gift";
import PayrollRoute from "@/app/(root)/(main)/report/payroll";
import { GiftCardInputs } from "@/components/Form/gift-card-inputs";
import {
	formatCurrency,
	roundCurrency,
	toCents,
} from "@/components/Form/helpers";
import { BottomModal } from "@/components/Gift/bottom-modal";
import { GiftCardTransaction } from "@/components/Gift/gift-card-transaction";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	clearHiddenPaymentAmounts,
	normalizeFinancialInput,
} from "@/utils/financial-validation";
import { moneyToCents, roundMoney } from "@/utils/money";
import type { EarningFormState, Gift } from "@/utils/types";
import { EarningFormSchema } from "@/utils/validation";

test.each([
	[0.045, 5],
	[1.005, 101],
	[2.675, 268],
	[0.0449, 4],
	[0.0451, 5],
])("half-up currency rounding of %s gives %s cents", (amount, cents) => {
	expect(moneyToCents(amount)).toBe(cents);
	expect(roundMoney(amount)).toBe(cents / 100);
});

test("gift history and report display the same rounded half-cent redemption", async () => {
	const redemption = {
		...tx,
		_id: "fractional" as Id<"transactions">,
		compensationMethods: ["Gift Card"],
		compInGift: 0.1,
		supply: 0,
		tipInGift: 0,
	};
	await render(<GiftCardTransaction transaction={redemption} isLight />);
	expect(screen.getByText("$0.11 Used")).toBeTruthy();
	await screen.unmount();
	jest
		.mocked(useQuery)
		.mockImplementation(
			(query, ..._args) =>
				(query === api.transactions.listByDateRange
					? [redemption]
					: []) as never,
		);
	await render(<GiftReportRoute />);
	expect(screen.getByText("$0.11")).toBeTruthy();
});

jest.mock("convex/react", () => ({
	useQuery: jest.fn(),
	useMutation: () => jest.fn(),
}));
jest.mock("@/convex/_generated/api", () => ({
	api: {
		transactions: {
			listByDateRange: "transactions",
			listByGiftCard: "history",
		},
		users: { usersByDateRange: "users", getUserById: "user" },
		shifts: { getShiftByDate: "shift", saveShift: "saveShift" },
		giftCards: { listByDateRange: "gifts" },
	},
}));
jest.mock("react-native-safe-area-context", () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-router", () => ({
	useLocalSearchParams: () => ({ startDate: "1000", endDate: "2000" }),
	useFocusEffect: jest.fn(),
	useIsFocused: () => true,
	useRouter: () => ({ navigate: jest.fn() }),
}));
jest.mock("expo-haptics", () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: { Light: "light" },
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@react-native-community/datetimepicker", () => () => null);
jest.mock("@/contexts/app-date-context", () => ({
	useAppDate: () => ({ startOfDay: new Date(1000), endOfDay: new Date(2000) }),
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: true }),
}));
jest.mock("@/hooks/use-authorization", () => ({
	useAuthorization: () => ({ isAuthorized: true }),
}));
jest.mock("react-native-reanimated", () => {
	const { FlatList, View } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		__esModule: true,
		default: { FlatList, View },
		FadeIn: {},
		FadeOut: {},
	};
});
jest.mock("react-native-gesture-handler", () => ({
	FlatList:
		jest.requireActual<typeof import("react-native")>("react-native").FlatList,
}));
jest.mock("react-native-paper", () => {
	const { Text, TextInput, View } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		Portal: Object.assign(View, { Host: View }),
		Button: Text,
		Text,
		TextInput: Object.assign(TextInput, { Icon: () => null }),
		useTheme: () => ({ colors: {} }),
	};
});
jest.mock("@/components/workspace/actions", () => ({
	WorkspaceActions: () => null,
}));
jest.mock("@/components/Form/form", () => ({ ErrorText: () => null }));
jest.mock("@/components/Buttons/delete-button", () => ({
	DeleteButton: () => null,
}));
jest.mock("@/components/Buttons/add-button", () => ({ AddButton: () => null }));
jest.mock("@gorhom/bottom-sheet", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { View, Pressable } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		BottomSheetModal: ({
			children,
			onChange,
		}: {
			children: React.ReactNode;
			onChange: (index: number) => void;
		}) =>
			React.createElement(
				Pressable,
				{ testID: "open-sheet", onPress: () => onChange(0) },
				children,
			),
		BottomSheetView: View,
	};
});
jest.mock("@/components/list-empty", () => ({
	ListEmptyComponent: () => null,
}));
jest.mock("@/components/Cards/report-card", () => {
	const React = jest.requireActual<typeof import("react")>("react");
	const { Text } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return {
		ReportCard: ({
			item,
		}: {
			item: { title: string; rows: { label: string; value: string }[] };
		}) =>
			React.createElement(
				Text,
				null,
				`${item.title}: ${item.rows.map((row) => `${row.label} ${row.value}`).join(" | ")}`,
			),
	};
});

const earning: EarningFormState = {
	compensation: "100",
	compensationMethods: ["Card"],
	tip: "20",
	tipMethods: ["Card"],
	technicianId: "tech" as Id<"users">,
	services: [],
	serviceDate: 1000,
};

test.each([
	["cash", { compensationMethods: ["Cash"] }, true],
	["card", {}, true],
	[
		"gift",
		{ compensationMethods: ["Gift Card"], compInGift: "100", giftCode: "GIFT" },
		true,
	],
	[
		"cash/card",
		{ compensationMethods: ["Cash", "Card"], compInCash: "30" },
		true,
	],
	[
		"card/gift",
		{
			compensationMethods: ["Card", "Gift Card"],
			compInGift: "50",
			giftCode: "GIFT",
		},
		true,
	],
	[
		"cash/gift",
		{
			compensationMethods: ["Cash", "Gift Card"],
			compInGift: "50",
			giftCode: "GIFT",
		},
		true,
	],
	[
		"three ways at taxed limit",
		{
			compensationMethods: ["Cash", "Card", "Gift Card"],
			compInCash: "30",
			compInGift: "75",
			giftCode: "GIFT",
		},
		true,
	],
	[
		"one cent above taxed limit",
		{
			compensationMethods: ["Cash", "Card", "Gift Card"],
			compInCash: "30",
			compInGift: "75.01",
			giftCode: "GIFT",
		},
		false,
	],
	["cash partial at total", { compInCash: "105" }, false],
	[
		"fixed discount service limit",
		{
			compensationMethods: ["Card", "Gift Card"],
			discount: "10",
			discountType: "Amount",
			compInGift: "90",
			giftCode: "GIFT",
		},
		true,
	],
	[
		"percent discount over limit",
		{
			compensationMethods: ["Card", "Gift Card"],
			discount: "10",
			discountType: "Percent",
			compInGift: "90.01",
			giftCode: "GIFT",
		},
		false,
	],
	[
		"supply cannot increase gift service cap",
		{
			compensationMethods: ["Card", "Gift Card"],
			supply: "10",
			compInGift: "115.50",
			giftCode: "GIFT",
		},
		false,
	],
	[
		"empty optionals",
		{ supply: "", discount: "", compInCash: "", tipInCash: "" },
		true,
	],
	["zero tip", { tip: "0" }, true],
	[
		"tip exact split",
		{
			tipMethods: ["Cash", "Card", "Gift Card"],
			tipInCash: "5",
			tipInGift: "15",
			giftCode: "GIFT",
		},
		true,
	],
	[
		"tip split one cent over",
		{
			tipMethods: ["Cash", "Card", "Gift Card"],
			tipInCash: "5",
			tipInGift: "15.01",
			giftCode: "GIFT",
		},
		false,
	],
	["negative compensation", { compensation: "-1" }, false],
	["nonnumeric tip", { tip: "invalid" }, false],
])("form validation: %s", (_name, patch, valid) => {
	expect(EarningFormSchema.safeParse({ ...earning, ...patch }).success).toBe(
		valid,
	);
});

test("currency helpers preserve cents and round decimal amounts", () => {
	expect(toCents("12.34")).toBe(1234);
	expect(toCents("")).toBe(0);
	expect(toCents("0.105")).toBe(11);
	expect(roundCurrency(12.346)).toBe(12.35);
	expect(formatCurrency(1234)).toBe("$12.34");
});

const tx = {
	_id: "transaction",
	_creationTime: 1000,
	technician: "Tech",
	compensation: 100,
	compensationMethods: ["Cash", "Card"],
	compInCash: 30,
	tip: 20,
	tipMethods: ["Cash", "Card"],
	tipInCash: 5,
	supply: 10,
	isCashSupply: true,
	discount: 10,
	discountType: "Amount" as const,
	isCashDiscount: true,
	serviceDate: 1500,
};

test("payroll detail consumes commission totals and displays commission plus payable tips", async () => {
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.users.usersByDateRange)
			return [{ _id: "tech", compensation: 50, tip: 15 }] as never;
		return { name: "Tech" } as never;
	});
	await render(<PayrollRoute />);
	expect(screen.getByText("$50")).toBeTruthy();
	expect(screen.getByText("$15")).toBeTruthy();
	expect(screen.getByText("$65")).toBeTruthy();
	expect(useQuery).toHaveBeenCalledWith(api.users.usersByDateRange, {
		startDate: 1000,
		endDate: 2000,
		report: true,
	});
});

test("earnings screen consumes raw earnings and all tips for selected technicians", async () => {
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.users.usersByDateRange)
			return [{ _id: "tech", compensation: 100, tip: 20 }] as never;
		if (reference === api.shifts.getShiftByDate)
			return [{ _id: "tech" }] as never;
		return { name: "Tech" } as never;
	});
	await render(<EarningsRoute />);
	expect(screen.getByText("$100")).toBeTruthy();
	expect(screen.getByText("$20")).toBeTruthy();
	expect(useQuery).toHaveBeenCalledWith(api.users.usersByDateRange, {
		startDate: 1000,
		endDate: 2000,
	});
});

function mockReportData(transactions: object[] = [tx]) {
	jest.mocked(useQuery).mockImplementation((reference, ..._args) => {
		if (reference === api.transactions.listByDateRange)
			return transactions as never;
		if (reference === api.users.usersByDateRange)
			return [{ _id: "tech", compensation: 50, tip: 15 }] as never;
		if (reference === api.giftCards.listByDateRange)
			return [{ balance: 132 }] as never;
		return [] as never;
	});
}

test("report overview computes mixed cash, payroll, discounts, income and gift totals", async () => {
	mockReportData();
	await render(<ReportsRoute />);
	expect(screen.getByText(/Payroll:.*Grand Total: \$65.00/)).toBeTruthy();
	expect(
		screen.getByText(
			/Cash:.*Total Cash Collected: \$45.00.*Total Real Cash: \$30.00/,
		),
	).toBeTruthy();
	// Overview displays collection before discount: 30 + 5 + 10 = 45.
	// Retained cash: 45 - 10 discount - 5 cash tip = 30.
	expect(screen.getByText(/Discounts:.*\$10.00/)).toBeTruthy();
	expect(screen.getByText(/Supply:.*\$10.00/)).toBeTruthy();
	expect(
		screen.getByText(/Income:.*Total Income: \$100.00.*Net Income: \$50.00/),
	).toBeTruthy();
	expect(screen.getByText(/Gift Cards:.*\$132.00/)).toBeTruthy();
	expect(useQuery).toHaveBeenCalledWith(
		api.users.usersByDateRange,
		expect.objectContaining({ report: true }),
	);
	expect(useQuery).toHaveBeenCalledWith(
		api.transactions.listByDateRange,
		expect.objectContaining({ report: true }),
	);
});

test("cash detail displays mixed transaction collection after cash discount", async () => {
	mockReportData();
	await render(<CashReportRoute />);
	expect(screen.getByText("$35.00")).toBeTruthy(); // 30 + 5 + 10 - 10
	// One $5 cash-tip value in the transaction row and one in the technician summary.
	expect(screen.getAllByText("$5.00")).toHaveLength(2);
	expect(useQuery).toHaveBeenCalledWith(api.transactions.listByDateRange, {
		startDate: 1000,
		endDate: 2000,
		report: true,
	});
});

test("cash-only tip is counted once in the technician summary", async () => {
	mockReportData([
		{
			...tx,
			compensationMethods: ["Cash"],
			compInCash: undefined,
			tipMethods: ["Cash"],
			tipInCash: undefined,
			supply: 0,
			discount: 0,
		},
	]);
	await render(<CashReportRoute />);
	// $20 appears once in the transaction and once in the technician summary.
	expect(screen.getAllByText("$20.00")).toHaveLength(2);
});

test.each([false, true])(
	"cash/gift reports count the remainder once, persisted cash portions: %s",
	async (persisted) => {
		mockReportData([
			{
				...tx,
				compensationMethods: ["Cash", "Gift Card"],
				compInGift: 40,
				compInCash: persisted ? 60 : undefined,
				tipMethods: ["Cash", "Gift Card"],
				tipInGift: 5,
				tipInCash: persisted ? 15 : undefined,
				supply: 0,
				discount: 0,
			},
		]);
		const overview = await render(<ReportsRoute />);
		expect(screen.getByText(/Cash:.*\$75.00/)).toBeTruthy(); // 60 service + 15 tip
		expect(screen.getByText(/Total Real Cash: \$60.00/)).toBeTruthy();
		await overview.unmount();
		await render(<CashReportRoute />);
		expect(screen.getByText("$75.00")).toBeTruthy();
		expect(screen.getAllByText("$15.00")).toHaveLength(2); // row and technician summary
	},
);

test("form method changes clear hidden portions and recompute cash/gift remainder", () => {
	const changed = clearHiddenPaymentAmounts({
		...earning,
		compensationMethods: ["Cash", "Gift Card"],
		tipMethods: ["Cash", "Gift Card"],
		giftCode: "GIFT",
		compInCash: "30",
		compInGift: "40",
		tipInCash: "5",
		tipInGift: "5",
	});
	expect(changed).toMatchObject({ compInCash: "", tipInCash: "" });
	expect(normalizeFinancialInput(changed)).toMatchObject({
		compInCash: 60,
		tipInCash: 15,
	});
	const removed = clearHiddenPaymentAmounts({
		...changed,
		compensationMethods: ["Card"],
		tipMethods: ["Card"],
	});
	expect(removed).toMatchObject({
		compInGift: "",
		tipInGift: "",
		giftCode: "",
	});
	expect(EarningFormSchema.safeParse(removed).success).toBe(true);
});

test.each([
	{ compensation: "Infinity" },
	{ compensation: "12junk" },
	{ compensation: " " },
	{ compensationMethods: ["Card", "Card"] },
	{ discount: "101", discountType: "Percent" },
	{ discount: "101", discountType: "Amount" },
	{ compInGift: "1" },
	{ compensationMethods: ["Gift Card"], compInGift: "1" },
])("form rejects API-invalid financial inputs: %j", (patch) => {
	expect(EarningFormSchema.safeParse({ ...earning, ...patch }).success).toBe(
		false,
	);
});

test("percentage discount uses full service value in overview and cash detail", async () => {
	mockReportData([{ ...tx, compensation: 200, discountType: "Percent" }]);
	const overview = await render(<ReportsRoute />);
	expect(screen.getByText(/Discounts:.*\$20.00/)).toBeTruthy();
	expect(screen.getByText(/Cash:.*Total Real Cash: \$20.00/)).toBeTruthy();
	await overview.unmount();
	await render(<CashReportRoute />);
	expect(screen.getByText("$25.00")).toBeTruthy(); // 30 + 5 + 10 - 20
});

test("empty reports render without monetary rows", async () => {
	jest.mocked(useQuery).mockReturnValue([] as never);
	await render(<ReportsRoute />);
	expect(screen.queryByText(/Payroll:/)).toBeNull();
	expect(screen.queryByText(/Cash:/)).toBeNull();
});

test.each([
	["exact balance", 68, "50", "10", "5", ""],
	["one cent short", 67.99, "50", "10", "5", "insufficient"],
	["discount cap", 200, "91", "", "", "cannot exceed"],
	["combined fractional tax", 1, "0.10", "0.10", "", ""],
	["service normalization tie", 10, "1.005", "", "", ""],
	["fractional supply tax", 10, "0.20", "0.0049", "", ""],
])(
	"gift input %s",
	async (_name, balance, compInGift, supply, tipInGift, error) => {
		const setGiftError = jest.fn();
		const card: Gift = {
			_id: "gift" as Id<"giftCards">,
			_creationTime: 1000,
			code: "TEST",
			value: 200,
			sellDate: 1000,
			transactionIds: [],
			balance,
		};
		await render(
			<GiftCardInputs
				earning={{
					...earning,
					giftCode: "TEST",
					compInGift,
					supply,
					tipInGift,
					discount: "10",
					discountType: "Amount",
				}}
				giftCard={card}
				giftError=""
				setGiftError={setGiftError}
				updateEarning={jest.fn()}
				type="compInGift"
			/>,
		);
		if (error)
			expect(setGiftError).toHaveBeenLastCalledWith(
				expect.stringContaining(error),
			);
		else expect(setGiftError).toHaveBeenLastCalledWith("");
		if (balance === 1)
			expect(screen.getByText("Available balance: $0.79")).toBeTruthy();
		if (compInGift === "1.005")
			expect(screen.getByText("Available balance: $8.94")).toBeTruthy();
		if (supply === "0.0049")
			expect(screen.getByText("Available balance: $9.78")).toBeTruthy();
	},
);

test.each(["compInGift", "tipInGift"] as const)(
	"editing %s checks exact balance and one-cent excess",
	async (type) => {
		const setGiftError = jest.fn();
		const updateEarning = jest.fn();
		const card: Gift = {
			_id: "gift" as Id<"giftCards">,
			_creationTime: 1000,
			code: "TEST",
			value: 68,
			sellDate: 1000,
			transactionIds: [],
			balance: 68,
		};
		await render(
			<GiftCardInputs
				earning={{
					...earning,
					giftCode: "TEST",
					compInGift: "50",
					supply: "10",
					tipInGift: "5",
				}}
				giftCard={card}
				giftError=""
				setGiftError={setGiftError}
				updateEarning={updateEarning}
				type={type}
			/>,
		);
		const input = screen.getByPlaceholderText(
			type === "compInGift"
				? "Enter amount from Gift Card. Max $100.00"
				: "Enter amount from Gift Card",
		);
		await fireEvent.changeText(input, type === "compInGift" ? "50" : "5");
		expect(setGiftError).toHaveBeenLastCalledWith("");
		await fireEvent.changeText(input, type === "compInGift" ? "50.01" : "5.01");
		expect(updateEarning).toHaveBeenLastCalledWith(
			type,
			type === "compInGift" ? "50.01" : "5.01",
		);
		expect(setGiftError).toHaveBeenLastCalledWith(
			expect.stringContaining("insufficient"),
		);
	},
);

test("gift history displays taxed service and supply plus untaxed tip", async () => {
	await render(
		<GiftCardTransaction
			transaction={{
				...tx,
				_id: "transaction" as Id<"transactions">,
				compensationMethods: ["Gift Card"],
				compInGift: 50,
				tipInGift: 5,
			}}
			isLight
		/>,
	);
	expect(screen.getByText(/\$68.00 Used/)).toBeTruthy();
});

test("gift modal Total Used includes redemptions outside the technician's visible history", async () => {
	jest
		.mocked(useQuery)
		.mockImplementation((_reference, ...args) =>
			args[0] === "skip" ? undefined : ([] as never),
		);
	const card: Gift = {
		_id: "gift" as Id<"giftCards">,
		_creationTime: 1000,
		code: "TEST",
		value: 200,
		sellDate: 1000,
		transactionIds: ["transaction" as Id<"transactions">],
		balance: 132,
	};
	await render(
		<BottomModal
			giftCard={card}
			isLight
			isAuthorized={false}
			bottomSheetRef={{ current: null }}
			closeBottomSheet={jest.fn()}
		/>,
	);
	expect(screen.getByText("$68.00")).toBeTruthy();
	expect(screen.getByText("$132.00")).toBeTruthy();
	await fireEvent.press(screen.getByTestId("open-sheet"));
	expect(useQuery).toHaveBeenLastCalledWith(api.transactions.listByGiftCard, {
		giftCardId: "gift",
	});
	expect(screen.getByText("Your Transaction History")).toBeTruthy();
});
