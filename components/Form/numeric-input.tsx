import { FormTextInput as TextInput } from "@/components/Form/form-text-input";

export const NumericInput = ({
	placeholder,
	value,
	onChangeText,
	icon,
	iconColor,
	iconSize = 22,
	inputMode = "decimal",
}: {
	placeholder: string;
	value: string | undefined;
	onChangeText: (value: string) => void;
	icon: string;
	iconColor?: string;
	iconSize?: number;
	inputMode?: "decimal" | "numeric";
}) => (
	<TextInput
		mode="outlined"
		placeholder={placeholder}
		keyboardType={inputMode === "decimal" ? "decimal-pad" : "numeric"}
		inputMode={inputMode}
		autoCapitalize="none"
		value={value}
		onChangeText={onChangeText}
		left={<TextInput.Icon icon={icon} size={iconSize} color={iconColor} />}
	/>
);
