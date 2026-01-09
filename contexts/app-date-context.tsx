import {
	createContext,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";

import { useReturnContext } from "@/hooks/useReturnContext";

type AppDateContextType = {
	date: Date;
	startOfDay: Date;
	endOfDay: Date;
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

	const value = useMemo(
		() => ({
			date: currentDate,
			startOfDay,
			endOfDay,
			setDate,
		}),
		[currentDate, setDate, startOfDay, endOfDay],
	);

	return (
		<AppDateContext.Provider value={value}>{children}</AppDateContext.Provider>
	);
};

export const useAppDate = () => useReturnContext(AppDateContext);
