import { Platform } from "react-native";

/** Clear focus before opening a web modal route so aria-hidden does not trap a control. */
export function blurActiveElementOnWeb() {
	if (Platform.OS !== "web") return;
	const active = document.activeElement;
	if (active instanceof HTMLElement) active.blur();
}
