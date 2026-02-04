import { useTheme } from "react-native-paper";
import { twMerge } from "tailwind-merge";

// Export cn utility for classname merging
export const cn = twMerge;

// Custom hook to get theme colors compatible with Paper
export function useThemeColor(colorName: string): string {
	const theme = useTheme();

	const colorMap: Record<string, string> = {
		foreground: theme.colors.onSurface,
		"muted-foreground": theme.colors.onSurfaceVariant,
		background: theme.colors.surface,
		"background-secondary": theme.colors.surfaceVariant,
		muted: theme.colors.onSurfaceDisabled,
		accent: theme.colors.primary,
		"accent-foreground": theme.colors.onPrimary,
	};

	return colorMap[colorName] || theme.colors.onSurface;
}

export function isToday(timestamp: number): boolean {
	const today = new Date();
	const txDate = new Date(timestamp);
	return (
		txDate.getDate() === today.getDate() &&
		txDate.getMonth() === today.getMonth() &&
		txDate.getFullYear() === today.getFullYear()
	);
}

export function isBeforeToday(timestamp: number): boolean {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const txDate = new Date(timestamp);
	txDate.setHours(0, 0, 0, 0);
	return txDate < today;
}
