import {
	createContext,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";

import { useReturnContext } from "@/hooks/use-return-context";

type AppDateContextType = {
	date: Date;
	startOfDay: Date;
	endOfDay: Date;
	midDay: Date;
	setDate: (date: Date) => void;
};

const AppDateContext = createContext<AppDateContextType | undefined>(undefined);

export const AppDateProvider = ({ children }: { children: ReactNode }) => {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());

	const setDate = useCallback((date: Date) => setCurrentDate(date), []);

	// Calculate start and end of day for the selected date
	const startOfDay = new Date(currentDate);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(currentDate);
	endOfDay.setHours(23, 59, 59, 999);
	const midDay = new Date(currentDate);
	midDay.setHours(12, 0, 0, 0);

	const value = useMemo(
		() => ({
			date: currentDate,
			startOfDay,
			endOfDay,
			midDay,
			setDate,
		}),
		[currentDate, setDate, startOfDay, endOfDay, midDay],
	);

	return (
		<AppDateContext.Provider value={value}>{children}</AppDateContext.Provider>
	);
};

export const useAppDate = () => useReturnContext(AppDateContext);
