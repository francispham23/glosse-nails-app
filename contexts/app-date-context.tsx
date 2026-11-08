import {
	createContext,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import { useReturnContext } from "@/hooks/use-return-context";
import { useSalonClock } from "@/hooks/use-salon-clock";
import { salonDayBounds, salonDayKey } from "@/utils/salon-time";

type AppDateContextType = {
	date: Date;
	now: number;
	startOfDay: Date;
	endOfDay: Date;
	midDay: Date;
	setDate: (date: Date) => void;
};

const AppDateContext = createContext<AppDateContextType | undefined>(undefined);

export const AppDateProvider = ({ children }: { children: ReactNode }) => {
	const now = useSalonClock();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const setDate = useCallback((date: Date) => {
		setSelectedDate(
			salonDayKey(date) === salonDayKey(Date.now()) ? null : date,
		);
	}, []);
	const value = useMemo(() => {
		const date = selectedDate ?? new Date(now);
		return { date, now, ...salonDayBounds(date), setDate };
	}, [selectedDate, now, setDate]);

	return (
		<AppDateContext.Provider value={value}>{children}</AppDateContext.Provider>
	);
};

export const useAppDate = () => useReturnContext(AppDateContext);
