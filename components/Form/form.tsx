import { Platform, Text, View } from "react-native";
import { cn } from "@/utils";

/* ----------------------------- form container ----------------------------- */
export function FormContainer({
	children,
	webForm = false,
	onSubmit,
}: {
	children: React.ReactNode;
	webForm?: boolean;
	onSubmit?: () => void | Promise<void>;
}) {
	/**
	 * reason for this FormContainer is to later add keyboard avoiding view
	 * to the form
	 *
	 * i think maybe that would be a good idea??
	 */
	const content = (
		<View
			className={
				Platform.OS === "web" ? "flex-1 gap-4 px-6" : "flex-1 gap-4 px-6 pt-20"
			}
		>
			{children}
		</View>
	);
	return Platform.OS === "web" && webForm ? (
		<form
			style={{ display: "contents" }}
			onSubmit={(event) => {
				event.preventDefault();
				void onSubmit?.();
			}}
		>
			{content}
			{onSubmit ? (
				<button type="submit" hidden tabIndex={-1} aria-hidden="true" />
			) : null}
		</form>
	) : (
		content
	);
}

/* ------------------------------- form header ------------------------------ */
export default function FormHeader({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	return (
		<View className="gap-2">
			<Text className={cn("font-extrabold text-4xl text-foreground")}>
				{title}
			</Text>
			<Text className={cn("text-muted-foreground")}>{description}</Text>
			{children}
		</View>
	);
}

/* ------------------------------ error text ----------------------------- */
export const ErrorText = ({ error }: { error: string | undefined }) =>
	error ? <Text className="px-4 text-error text-sm">{error}</Text> : null;
