import { createContext, type ReactNode, useCallback, useMemo } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Uniwind, useUniwind } from "uniwind";

import { useReturnContext } from "@/hooks";

export const glosseLightTheme = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		primary: "#5b4fe0",
		onPrimary: "#ffffff",
		primaryContainer: "#eeebff",
		onPrimaryContainer: "#4438a8",
		secondary: "#087f75",
		onSecondary: "#ffffff",
		secondaryContainer: "#ddf6f1",
		onSecondaryContainer: "#08645c",
		background: "#f7f8fc",
		onBackground: "#202331",
		surface: "#ffffff",
		onSurface: "#202331",
		surfaceVariant: "#eef0f6",
		onSurfaceVariant: "#596174",
		outline: "#787e90",
		outlineVariant: "#dfe2eb",
		elevation: {
			level0: "transparent",
			level1: "#f7f6fd",
			level2: "#f2f1fc",
			level3: "#eeecfc",
			level4: "#ebEafb",
			level5: "#e8e6fb",
		},
		error: "#ba1a1a",
		onError: "#ffffff",
		errorContainer: "#ffdad6",
		onErrorContainer: "#410002",
	},
};

export const glosseDarkTheme = {
	...MD3DarkTheme,
	colors: {
		...MD3DarkTheme.colors,
		primary: "#bdb4ff",
		onPrimary: "#261b68",
		primaryContainer: "#342b64",
		onPrimaryContainer: "#e5dfff",
		secondary: "#75dbcb",
		onSecondary: "#00382f",
		secondaryContainer: "#134d44",
		onSecondaryContainer: "#b2f2e5",
		background: "#15171f",
		onBackground: "#edeef5",
		surface: "#1e212c",
		onSurface: "#edeef5",
		surfaceVariant: "#2b2f3e",
		onSurfaceVariant: "#b6bdcf",
		outline: "#8991a7",
		outlineVariant: "#3c4254",
		elevation: {
			level0: "transparent",
			level1: "#262835",
			level2: "#2b2d3d",
			level3: "#303245",
			level4: "#313447",
			level5: "#35384b",
		},
		error: "#ffb4ab",
		onError: "#690005",
		errorContainer: "#93000a",
		onErrorContainer: "#ffdad6",
	},
};

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
		return theme === "light" ? glosseLightTheme : glosseDarkTheme;
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
