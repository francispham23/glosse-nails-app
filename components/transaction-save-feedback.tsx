import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { getErrorMessage } from "@/utils";

/** A saved request stays locked until its acknowledgement leaves the screen. */
export function useTransactionSave() {
	const locked = useRef(false);
	const acknowledging = useRef(false);
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const isLockedNow = useCallback(() => locked.current, []);
	const navigate = useRef<() => void>(() => {});
	const [isSaving, setIsSaving] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
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
	const acknowledge = () => {
		if (!success || acknowledging.current) return;
		acknowledging.current = true;
		try {
			navigate.current();
		} catch {
			// The write succeeded. Keep its draft and allow navigation to be retried.
		} finally {
			queueMicrotask(() => {
				acknowledging.current = false;
			});
		}
	};
	return {
		save,
		isLockedNow,
		isSaving,
		success,
		error,
		isLocked: isSaving || !!success,
		acknowledge,
	};
}

export function TransactionSaveFeedback({
	message,
	onAcknowledge,
}: {
	message: string;
	onAcknowledge: () => void;
}) {
	return (
		<Portal>
			<Dialog visible={!!message} dismissable={false}>
				<Dialog.Title>Success</Dialog.Title>
				<Dialog.Content>
					<Text variant="bodyMedium">{message}</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onAcknowledge}>OK</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
