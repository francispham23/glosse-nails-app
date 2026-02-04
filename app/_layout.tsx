import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ConvexReactClient } from "convex/react";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppDateProvider } from "@/contexts/app-date-context";
import { AppThemeProvider, useAppTheme } from "@/contexts/app-theme-context";
import "../global.css";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl)
	throw new Error("EXPO_PUBLIC_CONVEX_URL environment variable is not set");

const convex = new ConvexReactClient(convexUrl, {
	unsavedChangesWarning: false,
});

const secureStorage = {
	getItem: SecureStore.getItemAsync,
	setItem: SecureStore.setItemAsync,
	removeItem: SecureStore.deleteItemAsync,
};

/* ------------------------------ themed route ------------------------------ */
function ThemedLayout() {
	const { paperTheme } = useAppTheme();

	return (
		<PaperProvider theme={paperTheme}>
			<BottomSheetModalProvider>
				<Slot />
			</BottomSheetModalProvider>
		</PaperProvider>
	);
}

/* ------------------------------- root layout ------------------------------ */
export default function Layout() {
	return (
		<GestureHandlerRootView className="flex-1">
			<ConvexAuthProvider
				client={convex}
				storage={
					Platform.OS === "android" || Platform.OS === "ios"
						? secureStorage
						: undefined
				}
			>
				<SafeAreaProvider>
					<AppDateProvider>
						<AppThemeProvider>
							<ThemedLayout />
						</AppThemeProvider>
					</AppDateProvider>
				</SafeAreaProvider>
			</ConvexAuthProvider>
		</GestureHandlerRootView>
	);
}
