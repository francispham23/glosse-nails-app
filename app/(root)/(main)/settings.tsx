import { useState } from "react";
import { useQuery } from "convex/react";
import {  Button, Spinner, useThemeColor } from "heroui-native";
import { ScrollView, Text, View, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { api } from "@/convex/_generated/api";

export default function SettingsRoute() {
	const themeColorForeground = useThemeColor("foreground");
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const user = useQuery(api.users.viewer);

  if (!user) return null;

  // TODO: delete user
  /*
  const handleDeleteUser = async () => {
    const { error, data } = await authClient.deleteUser(
      {},
      {
        onRequest: () => {
          setIsDeletingUser(true);
        },
        onSuccess: () => {
          console.log("User deleted successfully");
          setIsDeletingUser(false);
          // The auth system will automatically handle the redirect
        },
        onError: (ctx) => {
          setIsDeletingUser(false);
          console.error(ctx.error);
          Alert.alert("Error", ctx.error.message || "Failed to delete user");
        },
      }
    );
    console.log(data, error);
  };
  */

  return (
    <View className="flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        contentContainerClassName="px-6 py-2 gap-4 min-h-full "
      >
        <Text className="text-2xl font-bold">User Info Section</Text>
        <View className="flex">
          <Text className="text-lg text-muted-foreground">{user.name}</Text>
          <Text className="text-lg text-muted-foreground">{user.email}</Text>
          <Text className="text-lg text-muted-foreground">
            created {new Date(user._creationTime).toDateString()}
          </Text>
        </View>
        {/* Delete User*/}
        <View className="flex gap-4">
          <Button
            variant="tertiary"
            size="sm"
            className="self-start rounded-full"
            isDisabled={isDeletingUser}
            onPress={async () => {
              Alert.alert(
                "Delete User",
                "Are you sure you want to delete your account?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    onPress: async () => {
                      // await handleDeleteUser();
                    },
                  },
                ]
              );
            }}
          >
              <Ionicons
                name="trash-outline"
                size={18}
                color={themeColorForeground}
              />
            <Button.Label>
              {isDeletingUser ? "Deleting..." : "Delete User"}
            </Button.Label>
              {isDeletingUser ? <Spinner color={themeColorForeground} /> : null}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
