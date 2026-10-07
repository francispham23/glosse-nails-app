import { useWindowDimensions } from "react-native";

export function getWorkspaceLayout(width: number, fontScale = 1) {
	const availableWidth = width / Math.max(1, fontScale);
	const mode =
		availableWidth < 600
			? "compact"
			: availableWidth < 1024
				? "rail"
				: "sidebar";
	const navigationWidth = mode === "compact" ? 0 : mode === "rail" ? 96 : 224;
	return {
		mode,
		navigationWidth,
		isCompact: mode === "compact",
		isWide: availableWidth - navigationWidth >= 720,
	};
}

export function useWorkspaceLayout() {
	const { width, fontScale } = useWindowDimensions();
	return getWorkspaceLayout(width, fontScale);
}
