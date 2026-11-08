import { afterEach, expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import { AppDateProvider, useAppDate } from "@/contexts/app-date-context";
import { useSalonClock } from "@/hooks/use-salon-clock";
import { isOpenSalonDay, salonDayKey } from "@/utils/salon-time";

afterEach(() => {
	jest.useRealTimers();
});
test("an open app refreshes at cutoff and Vancouver midnight", async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date("2026-11-08T04:59:59Z"));
	const { result, unmount } = await renderHook(useSalonClock);
	expect(isOpenSalonDay(result.current, result.current)).toBe(true);
	await act(() => jest.advanceTimersByTime(1000));
	expect(isOpenSalonDay(result.current, result.current)).toBe(false);
	await act(() => jest.advanceTimersByTime(2 * 60 * 60 * 1000));
	expect(salonDayKey(result.current)).toBe("2026-11-08");
	expect(isOpenSalonDay(result.current, result.current)).toBe(true);
	await unmount();
});

test("today follows Vancouver midnight while an explicit historical date stays selected", async () => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date("2026-11-08T06:59:59Z"));
	const { result, unmount } = await renderHook(useAppDate, {
		wrapper: AppDateProvider,
	});
	expect(salonDayKey(result.current.date)).toBe("2026-11-07");
	await act(() => jest.advanceTimersByTime(1000));
	expect(result.current.startOfDay.toISOString()).toBe(
		"2026-11-08T07:00:00.000Z",
	);
	await act(() => result.current.setDate(new Date("2026-11-01T19:00:00Z")));
	await act(() => jest.advanceTimersByTime(24 * 60 * 60 * 1000));
	expect(salonDayKey(result.current.date)).toBe("2026-11-01");
	await unmount();
});
