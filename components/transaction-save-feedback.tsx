import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { getErrorMessage } from "@/utils";

/** A confirmed save stays locked until navigation unmounts the form. */
export function useTransactionSave() {
	const locked = useRef(false);
	const navigating = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const isLockedNow = useCallback(() => locked.current, []);
	const navigate = useRef<(() => void) | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const returnToPreviousScreen = () => {
		if (!mounted.current || !navigate.current || navigating.current) return;
		navigating.current = true;
		try {
			navigate.current();
		} catch {
			// The write succeeded. Keep it locked and allow navigation to be retried.
		} finally {
			queueMicrotask(() => {
				navigating.current = false;
			});
		}
	};
	const save = async (
		operation: () => Promise<unknown>,
		options: {
			blockedMessage: string;
			successMessage: string;
			fallback: string;
			onSuccess: () => void;
		},
	) => {
		if (locked.current) return;
		setError("");
		if (options.blockedMessage) {
			setError(options.blockedMessage);
			return;
		}
		locked.current = true;
		setIsSaving(true);
		try {
			await operation();
			if (!mounted.current) return;
			navigate.current = options.onSuccess;
			setSuccess(options.successMessage);
			returnToPreviousScreen();
		} catch (cause) {
			if (!mounted.current) return;
			const data =
				typeof cause === "object" && cause !== null && "data" in cause
					? cause.data
					: undefined;
			const message =
				typeof data === "string"
					? data
					: getErrorMessage(cause, options.fallback);
			setError(message.startsWith("[CONVEX ") ? options.fallback : message);
			locked.current = false;
		} finally {
			if (mounted.current) setIsSaving(false);
		}
	};
	return {
		save,
		isLockedNow,
		isSaving,
		success,
		error,
		isLocked: isSaving || !!success,
		returnToPreviousScreen,
	};
}

export function TransactionSaveFeedback({
	message,
	onReturn,
}: {
	message: string;
	onReturn: () => void;
}) {
	if (!message) return null;
	// Render in the screen itself so recovery is visible above native modals.
	return (
		<View style={{ padding: 16 }}>
			<Text accessibilityRole="alert" variant="bodyMedium">
				{message}
			</Text>
			<Button onPress={onReturn}>Return to previous screen</Button>
		</View>
	);
}
