import { useState } from "react";
import { Button, TextInput } from "react-native-paper";

import FormHeader, { FormContainer } from "@/components/form";

// TODO: Implement password reset request logic here
export default function RequestPasswordResetRoute() {
	// const router = useRouter();

	/* ---------------------------------- state --------------------------------- */
	const [email, setEmail] = useState("");
	const [isLoading] = useState(false);

	/* ------------------------ handle request reset --------------------------- */

	// TODO: Implement password reset request logic here
	/*
  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    const { error, data } = await authClient.requestPasswordReset(
      {
        email: email,
        redirectTo: Linking.createURL("email/reset-password"),
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        
        onError: (ctx) => {
          setIsLoading(false);
          Alert.alert(
            "Error",
            ctx.error.message || "Failed to send reset link"
          );
        },
        onSuccess: () => {
          setIsLoading(false);
          Alert.alert("Success", "Reset link sent to your email");
          router.back();
          console.log("success!");
        },
      }
    );
    console.log(data, error);
  };
  */

	/* --------------------------------- return --------------------------------- */
	return (
		<FormContainer>
			{/* header */}
			<FormHeader
				title="Reset Password"
				description="Enter your email to receive a password reset link"
			/>
			{/* email */}
			<TextInput
				mode="outlined"
				placeholder="Enter your email"
				keyboardType="email-address"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
				left={<TextInput.Icon icon="email-outline" />}
				className="h-16 rounded-3xl"
			/>
			{/* submit button */}
			<Button
				// onPress={handleRequestReset}
				disabled={isLoading}
				mode="contained"
				loading={isLoading}
				className="rounded-3xl"
			>
				{isLoading ? "Sending..." : "Send Reset Link"}
			</Button>
		</FormContainer>
	);
}
