import { createContext, type ReactNode, useCallback, useMemo } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Uniwind, useUniwind } from "uniwind";

import { useReturnContext } from "@/hooks/use-return-context";

type ThemeName = "light" | "dark";

type AppThemeContextType = {
	currentTheme: string;
	isLight: boolean;
	isDark: boolean;
	setTheme: (theme: ThemeName) => void;
	toggleTheme: () => void;
	paperTheme: typeof MD3LightTheme | typeof MD3DarkTheme;
};

const AppThemeContext = createContext<AppThemeContextType | undefined>(
	undefined,
);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
	const { theme } = useUniwind();

	const isLight = useMemo(() => {
		return theme === "light";
	}, [theme]);

	const isDark = useMemo(() => {
		return theme === "dark";
	}, [theme]);

	const setTheme = useCallback((newTheme: ThemeName) => {
		Uniwind.setTheme(newTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		Uniwind.setTheme(theme === "light" ? "dark" : "light");
	}, [theme]);

	const paperTheme = useMemo(() => {
		return theme === "light" ? MD3LightTheme : MD3DarkTheme;
	}, [theme]);

	const value = useMemo(
		() => ({
			currentTheme: theme,
			isLight,
			isDark,
			setTheme,
			toggleTheme,
			paperTheme,
		}),
		[theme, isLight, isDark, setTheme, toggleTheme, paperTheme],
	);

	return (
		<AppThemeContext.Provider value={value}>
			{children}
		</AppThemeContext.Provider>
	);
};

export const useAppTheme = () => useReturnContext(AppThemeContext);
