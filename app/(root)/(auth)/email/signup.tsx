import FormHeader, { FormContainer } from "@/components/form";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Link } from "expo-router";
import { Button, Spinner, TextField, useTheme } from "heroui-native";
import { useState } from "react";
import { Alert, Text } from "react-native";

// TODO: Implement sign-up logic with Convex Auth
export default function SignUpRoute() {
  const { colors } = useTheme();

  /* ---------------------------------- state --------------------------------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading] = useState(false);

  /* ------------------------------ handle signup ----------------------------- */
  const handleSignUp = async () => {
    /**
     * FEAT: Add your own form validation validation here
     * i've been using tanstack form for react native with zod
     *
     * but this is just a base for you to get started
     */
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
  };

  /* --------------------------------- return --------------------------------- */
  return (
    <FormContainer>
      {/* header */}
      <FormHeader
        title="Sign Up"
        description="Create your account to get started"
      />
      {/* name */}
      <TextField isRequired>
        <TextField.Input
          className="h-16 rounded-3xl"
          placeholder="Enter your full name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        >
          <TextField.InputStartContent className="pointer-events-none pl-2">
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputStartContent>
        </TextField.Input>
      </TextField>
      {/* email */}
      <TextField isRequired>
        <TextField.Input
          className="h-16 rounded-3xl"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        >
          <TextField.InputStartContent className="pointer-events-none pl-2">
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputStartContent>
        </TextField.Input>
      </TextField>
      {/* password */}
      <TextField isRequired>
        <TextField.Input
          className="h-16 rounded-3xl"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        >
          <TextField.InputStartContent className="pointer-events-none pl-2">
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputStartContent>
          <TextField.InputEndContent className="pointer-events-none pr-2">
            <Ionicons
              name="eye-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputEndContent>
        </TextField.Input>
      </TextField>
      {/* confirm password */}
      <TextField isRequired>
        <TextField.Input
          className="h-16 rounded-3xl"
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        >
          <TextField.InputStartContent className="pointer-events-none pl-2">
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputStartContent>
          <TextField.InputEndContent className="pointer-events-none pr-2">
            <Ionicons
              name="checkmark-outline"
              size={20}
              color={colors.mutedForeground}
            />
          </TextField.InputEndContent>
        </TextField.Input>
      </TextField>
      {/* submit button */}
      <Button
        onPress={handleSignUp}
        disabled={isLoading}
        className="rounded-3xl"
        size="lg"
      >
        <Button.LabelContent>
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button.LabelContent>
        <Button.EndContent>
          {isLoading ? <Spinner color={colors.background} /> : null}
        </Button.EndContent>
      </Button>
      <Text className="px-14 text-center text-muted-foreground text-sm">
        by continuing you agree to our{" "}
        <Link href="http://convex.dev" className="text-foreground underline">
          terms of service
        </Link>{" "}
        and{" "}
        <Link href="http://convex.dev" className="text-foreground underline">
          privacy policy
        </Link>
      </Text>
    </FormContainer>
  );
}
