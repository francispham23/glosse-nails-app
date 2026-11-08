import type { ComponentProps } from "react";
import { TextInput, useTheme } from "react-native-paper";
import { controlStyles } from "@/components/workspace/control-styles";

// Keep Paper's input/focus/error behavior; style its actual outline, not just its wrapper.
export const FormTextInput = Object.assign(
	function FormTextInput({
		style,
		outlineStyle,
		contentStyle,
		...props
	}: ComponentProps<typeof TextInput>) {
		const { colors } = useTheme();
		return (
			<TextInput
				mode="outlined"
				outlineColor={colors.outlineVariant}
				activeOutlineColor={colors.primary}
				{...props}
				style={[
					controlStyles.field,
					{ backgroundColor: colors.surface },
					style,
				]}
				outlineStyle={[controlStyles.outline, outlineStyle]}
				contentStyle={[controlStyles.fieldContent, contentStyle]}
			/>
		);
	},
	{ Icon: TextInput.Icon, Affix: TextInput.Affix },
);
