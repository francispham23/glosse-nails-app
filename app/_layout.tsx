import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppDateProvider } from "@/contexts/app-date-context";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { cleanupOldTransactions } from "@/utils/transaction-storage";
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
	return (
		<HeroUINativeProvider>
			<Slot />
		</HeroUINativeProvider>
	);
}

/* ------------------------------- root layout ------------------------------ */
export default function Layout() {
	// Clean up old transactions on app startup
	useEffect(() => {
		cleanupOldTransactions();
	}, []);

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
