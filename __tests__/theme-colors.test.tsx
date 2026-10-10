import { expect, jest, test } from "@jest/globals";
import { renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { PaperProvider } from "react-native-paper";
import {
	glosseDarkTheme,
	glosseLightTheme,
} from "@/contexts/app-theme-context";
import { useThemeColor } from "@/utils";

jest.mock("uniwind", () => ({
	Uniwind: {},
	useUniwind: () => ({ theme: "dark" }),
}));
jest.mock("@/hooks", () => ({ useReturnContext: jest.fn() }));
function luminance(hex: string) {
	const matches = hex.slice(1).match(/../g);
	if (!matches) {
		throw new Error(`Invalid hex color: ${hex}`);
	}
	const channels = matches
		.map((c) => Number.parseInt(c, 16) / 255)
		.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a: string, b: string) {
	const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const theme of [glosseLightTheme, glosseDarkTheme]) {
	test(`${theme.dark ? "dark" : "light"} semantic roles preserve page/surface distinction and legible content`, async () => {
		const wrapper = ({ children }: PropsWithChildren) => (
			<PaperProvider theme={theme}>{children}</PaperProvider>
		);
		const { result } = await renderHook(
			() => ({
				background: useThemeColor("background"),
				surface: useThemeColor("surface"),
				error: useThemeColor("error"),
			}),
			{ wrapper },
		);
		expect(result.current.background).toBe(theme.colors.background);
		expect(result.current.surface).toBe(theme.colors.surface);
		expect(result.current.error).toBe(theme.colors.error);
		for (const bg of [
			theme.colors.background,
			theme.colors.surface,
			theme.colors.surfaceVariant,
			theme.colors.elevation.level3,
		]) {
			expect(contrast(theme.colors.onSurface, bg)).toBeGreaterThanOrEqual(4.5);
			expect(
				contrast(theme.colors.onSurfaceVariant, bg),
			).toBeGreaterThanOrEqual(4.5);
		}
		expect(
			contrast(theme.colors.error, theme.colors.surface),
		).toBeGreaterThanOrEqual(4.5);
		expect(
			contrast(theme.colors.onError, theme.colors.error),
		).toBeGreaterThanOrEqual(4.5);
		expect(
			contrast(theme.colors.onPrimary, theme.colors.primary),
		).toBeGreaterThanOrEqual(4.5);
	});
}
