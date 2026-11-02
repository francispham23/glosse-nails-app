import { Platform } from "react-native";

export const modalGroupPresentation = Platform.select({
	web: "transparentModal" as const,
	default: "modal" as const,
});

export const modalGroupAnimation = Platform.select({
	web: "none" as const,
	default: undefined,
});
