import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigationOptions } from "@/hooks/useNavigationOptions";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "heroui-native";
import { useState } from "react";
import { Pressable, Text } from "react-native";

export default function MainLayout() {
  const { standard } = useNavigationOptions();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Informational",
          headerTitle: "Informational",
          headerLargeTitle: true,
          headerBackTitle: "Home",
          ...standard,
          headerRight: () => <SettingsButton />,
          headerLeft: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerBackButtonDisplayMode: "generic",
          headerLargeTitle: true,
          ...standard,
          headerRight: () => <SignOutButton />,
        }}
      />
    </Stack>
  );
}

const SettingsButton = () => {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      className="justify-center rounded-full p-2.5"
      onPress={() => {
        router.navigate("/settings");
      }}
    >
      <Ionicons name="settings-outline" size={18} color={colors.foreground} />
    </Pressable>
  );
};

const SignOutButton = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuthActions();

  // TODO: Handle sign out with confirmation
  /* 
  const handleSignOut = async () => {
    const { error, data } = await authClient.signOut(
      {},
      {
        onRequest: () => {
          setIsSigningOut(true);
        },
        onSuccess: () => {
          setIsSigningOut(false);
          console.log("Sign out successful");
        },
        onError: (ctx) => {
          console.error(ctx.error);
          Alert.alert("Error", ctx.error.message || "Failed to sign out");
          setIsSigningOut(false);
        },
      }
    );
    console.log(data, error);
  };
  
  const handleOnPress = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          await handleSignOut();
        },
      },
    ]);
  };
  */

  return (
    <Pressable
      className="justify-center rounded-full px-3"
      disabled={isSigningOut}
      // onPress={handleOnPress}
      onPress={() => {
        setIsSigningOut(true);
        void signOut();
      }}
    >
      <Text className="text-foreground">Sign Out</Text>
    </Pressable>
  );
};
