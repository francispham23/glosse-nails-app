import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { salonDate, salonDayBounds, salonParts } from "@/utils/salon-time";

export function useSalonClock() {
	const [now, setNow] = useState(Date.now);
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const refresh = () => {
			clearTimeout(timer);
			const current = Date.now();
			setNow(current);
			const p = salonParts(current);
			const cutoff = salonDate(p.year, p.month, p.day, 22).getTime();
			const next =
				current < cutoff
					? cutoff
					: salonDayBounds(current).endOfDay.getTime() + 1;
			timer = setTimeout(refresh, Math.max(1, next - current));
		};
		refresh();
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") refresh();
		});
		if (Platform.OS === "web") window.addEventListener("focus", refresh);
		return () => {
			clearTimeout(timer);
			subscription.remove();
			if (Platform.OS === "web") window.removeEventListener("focus", refresh);
		};
	}, []);
	return now;
}
