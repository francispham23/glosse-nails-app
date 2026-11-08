import { expect, jest, test } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { GiftCard } from "@/components/Cards/gift-card";
import type { Gift } from "@/utils";

jest.mock("react-native-reanimated", () => {
	const { View } =
		jest.requireActual<typeof import("react-native")>("react-native");
	return { __esModule: true, default: { View } };
});
let mockBlur: (() => void) | undefined;
const mockPresent = jest.fn();
const mockDismiss = jest.fn();
jest.mock("expo-router", () => ({
	useFocusEffect: (callback: () => () => void) => {
		const { useEffect } = jest.requireActual<typeof import("react")>("react");
		useEffect(() => {
			mockBlur = callback();
			return mockBlur;
		}, [callback]);
	},
}));
jest.mock("@/components/Gift/bottom-modal", () => ({
	BottomModal: ({
		bottomSheetRef,
	}: {
		bottomSheetRef: { current: unknown };
	}) => {
		bottomSheetRef.current = { present: mockPresent, dismiss: mockDismiss };
		return null;
	},
}));
jest.mock("@/contexts/app-theme-context", () => ({
	useAppTheme: () => ({ isLight: false }),
}));
jest.mock("@/components/workspace/screen", () => ({ workspaceStyles: {} }));

const gift = {
	_id: "gift",
	code: "NAV-TEST",
	balance: 50,
	value: 50,
	transactionIds: [],
} as unknown as Gift;

test("gift details dismiss when the owning route loses focus and can reopen", async () => {
	await render(<GiftCard giftCard={gift} isAuthorized={false} overview />);
	await fireEvent.press(
		screen.getByRole("button", { name: "Gift card NAV-TEST, balance $50.00" }),
	);
	expect(mockPresent).toHaveBeenCalledTimes(1);
	await act(() => mockBlur?.());
	expect(mockDismiss).toHaveBeenCalledTimes(1);
	await fireEvent.press(
		screen.getByRole("button", { name: "Gift card NAV-TEST, balance $50.00" }),
	);
	expect(mockPresent).toHaveBeenCalledTimes(2);
});
