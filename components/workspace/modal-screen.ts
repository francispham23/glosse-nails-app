import { Platform } from "react-native";
import { cn } from "@/utils";

export function modalScreenClassName(...extra: (string | undefined)[]) {
	return cn("flex-1 gap-2 px-6", Platform.OS !== "web" && "pt-18", ...extra);
}
