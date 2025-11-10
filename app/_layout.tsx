import { AppThemeProvider, useAppTheme } from "@/contexts/app-theme-context";
import SplashScreenProvider from "@/providers/SplashScreenProvider";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { HeroUINativeProvider } from "heroui-native";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

/* ------------------------------ themed route ------------------------------ */
function ThemedLayout() {
  const { currentTheme } = useAppTheme();
  return (
    <HeroUINativeProvider
      config={{
        colorScheme: "system",
        theme: currentTheme,
        textProps: {
          allowFontScaling: false,
        },
      }}
    >
      <Slot />
    </HeroUINativeProvider>
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
          <SplashScreenProvider>
            <AppThemeProvider>
              <ThemedLayout />
            </AppThemeProvider>
          </SplashScreenProvider>
        </SafeAreaProvider>
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}
