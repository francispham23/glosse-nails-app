import { Text, View } from "react-native";
import { useAppTheme } from "@/contexts/app-theme-context";
import { cn } from "@/utils";

/* ----------------------------- form container ----------------------------- */
export function FormContainer({ children }: { children: React.ReactNode }) {
	/**
	 * reason for this FormContainer is to later add keyboard avoiding view
	 * to the form
	 *
	 * i think maybe that would be a good idea??
	 */
	return <View className="flex-1 gap-4 px-6 pt-20">{children}</View>;
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
	const { isLight } = useAppTheme();

	return (
		<View className="gap-2">
			<Text
				className={cn(
					"font-extrabold text-4xl text-foreground",
					!isLight && "text-gray-300",
				)}
			>
				{title}
			</Text>
			<Text
				className={cn("text-muted-foreground", !isLight && "text-gray-400")}
			>
				{description}
			</Text>
			{children}
		</View>
	);
}

/* ------------------------------ error text ----------------------------- */
export const ErrorText = ({ error }: { error: string | undefined }) =>
	error ? <Text className="px-4 text-red-500 text-sm">{error}</Text> : null;
