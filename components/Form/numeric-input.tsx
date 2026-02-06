import { TextInput } from "react-native-paper";

export const NumericInput = ({
	placeholder,
	value,
	onChangeText,
	icon,
	iconColor,
}: {
	placeholder: string;
	value: string | undefined;
	onChangeText: (value: string) => void;
	icon: string;
	iconColor: string;
}) => (
	<TextInput
		mode="outlined"
		className="h-16 rounded-3xl"
		placeholder={placeholder}
		keyboardType="numeric"
		autoCapitalize="none"
		value={value}
		onChangeText={onChangeText}
		left={<TextInput.Icon icon={icon} size={22} color={iconColor} />}
	/>
);
